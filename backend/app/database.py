import os
import re
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote, unquote
from app.config import settings

logger = logging.getLogger("uvicorn")

def clean_database_url(raw_url: str) -> str:
    if not raw_url:
        return "sqlite:///./xyz_local.db"
    
    url = raw_url.strip().strip("'").strip('"')
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    if "://" in url and ("@" in url):
        try:
            proto, rest = url.split("://", 1)
            if "@" in rest:
                creds, host_part = rest.rsplit("@", 1)
                if ":" in creds:
                    user, pwd = creds.split(":", 1)
                    clean_pwd = quote(unquote(pwd))
                    url = f"{proto}://{user}:{clean_pwd}@{host_part}"
        except Exception:
            pass

    # If pointing to direct Supabase host (db.<ref>.supabase.co),
    # direct hosts are IPv6-only. Cloud hosts like Render do not support IPv6 outbound routing,
    # causing psycopg2.OperationalError: Network is unreachable.
    # Automatically rewrite to Supabase's IPv4 Connection Pooler.
    if "db." in url and ".supabase.co" in url:
        m = re.search(r"db\.([a-zA-Z0-9_-]+)\.supabase\.co", url)
        if m:
            ref = m.group(1)
            region = os.getenv("SUPABASE_REGION", "ap-south-1")
            pooler_host = f"aws-0-{region}.pooler.supabase.com"
            url = url.replace(f"db.{ref}.supabase.co", pooler_host)
            # Ensure user is formatted as postgres.<ref> for Supabase pooler
            if f"://postgres.{ref}:" not in url and "://postgres:" in url:
                url = url.replace("://postgres:", f"://postgres.{ref}:")

    return url

def _init_engine():
    db_url = clean_database_url(settings.DATABASE_URL)
    
    if db_url.startswith("postgresql"):
        has_psycopg2 = False
        has_psycopg = False
        try:
            import psycopg2  # type: ignore
            has_psycopg2 = True
        except ImportError:
            pass

        try:
            import psycopg  # type: ignore
            has_psycopg = True
        except ImportError:
            pass

        if has_psycopg2:
            if not db_url.startswith("postgresql+"):
                db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        elif has_psycopg:
            if not db_url.startswith("postgresql+"):
                db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)
        else:
            logger.warning("PostgreSQL driver not installed in current environment; using SQLite.")
            return create_engine("sqlite:///./xyz_local.db", connect_args={"check_same_thread": False})

        # Test PostgreSQL connection with a 4s timeout so startup is never delayed
        try:
            test_engine = create_engine(
                db_url,
                connect_args={"connect_timeout": 4},
                pool_pre_ping=True,
                echo=False
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to cloud PostgreSQL database.")
            return test_engine
        except Exception as exc:
            logger.warning(
                "Could not connect to PostgreSQL (%s). Falling back to resilient SQLite database to guarantee 100%% uptime.",
                exc
            )
            return create_engine("sqlite:///./xyz_local.db", connect_args={"check_same_thread": False})

    return create_engine("sqlite:///./xyz_local.db", connect_args={"check_same_thread": False})

engine = _init_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_sqlite_columns():
    """Safely adds newly introduced columns in local SQLite dev databases without wiping data."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    migrations = [
        ("workspaces", "slug", "TEXT DEFAULT 'acme-growth-labs'"),
        ("workspaces", "tier", "TEXT DEFAULT 'Pro Enterprise'"),
        ("workspace_members", "name", "TEXT DEFAULT 'Team Member'"),
        ("workspace_members", "email", "TEXT DEFAULT 'member@example.com'"),
        ("workspace_members", "status", "TEXT DEFAULT 'Active'"),
        ("social_accounts", "followers", "TEXT DEFAULT '0'"),
        ("social_accounts", "avatar", "TEXT DEFAULT '🌐'"),
        ("publishing_queue", "post_title", "TEXT DEFAULT 'Scheduled Creative'"),
        ("publishing_queue", "format_label", "TEXT DEFAULT 'Carousel'"),
    ]

    with engine.begin() as conn:
        for table, col, col_def in migrations:
            res = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
            existing_cols = {row[1] for row in res}
            if existing_cols and col not in existing_cols:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
