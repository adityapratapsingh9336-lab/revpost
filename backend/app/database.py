from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import quote, unquote
from app.config import settings

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

    return url

# Configure engine with connect_args for SQLite or PostgreSQL
connect_args = {}
db_url = clean_database_url(settings.DATABASE_URL)

if db_url.startswith("postgresql"):
    # Detect installed PostgreSQL driver
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
        # Fallback to local SQLite if running in an environment without Postgres drivers
        print("NOTICE: PostgreSQL driver not installed in current environment; using SQLite.")
        db_url = "sqlite:///./xyz_local.db"

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

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
