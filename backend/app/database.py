from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Configure engine with connect_args for SQLite if applicable
connect_args = {}
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    # SQLAlchemy requires postgresql:// protocol identifier
    db_url = db_url.replace("postgres://", "postgresql://", 1)

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
