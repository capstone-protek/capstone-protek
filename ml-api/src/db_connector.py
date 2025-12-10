# ml-api/src/db_connector.py
import asyncpg
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

# Load .env file
load_dotenv()

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

db_pool = None

async def create_pool():
    """Create PostgreSQL connection pool for Railway"""
    global db_pool
    
    if db_pool is not None:
        return db_pool

    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL environment variable is not set.\n"
            "Make sure .env file exists with DATABASE_URL"
        )

    # Parse DATABASE_URL
    url = urlparse(DATABASE_URL)
    
    # Validate scheme
    if url.scheme not in ['postgres', 'postgresql']:
        raise ValueError("Unsupported database scheme in DATABASE_URL.")
    
    # Hide password in logs
    safe_url = f"{url.scheme}://{url.username}:****@{url.hostname}:{url.port}{url.path}"
    
    try:
        print(f"🔌 Connecting to Railway PostgreSQL...")
        print(f"   URL: {safe_url}")
        
        # Database configuration
        DB_CONFIG = {
            'user': url.username,
            'password': url.password,
            'database': url.path.lstrip('/'),
            'host': url.hostname,
            'port': url.port or 5432,
        }
        
        # Create connection pool
        db_pool = await asyncpg.create_pool(
            **DB_CONFIG,
            min_size=2,
            max_size=10,
            command_timeout=60
        )
        
        print(f"✅ Database pool created successfully")
        
        # Test connection
        async with db_pool.acquire() as conn:
            version = await conn.fetchval('SELECT version()')
            print(f"   PostgreSQL: {version.split(',')[0]}")
        
        return db_pool
        
    except Exception as e:
        print(f"❌ Failed to create database pool: {e}")
        raise

async def close_pool():
    """Close database connection pool"""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None
        print("✅ Database pool closed")

async def execute_query(sql: str, *args):
    """Execute query and return results"""
    if db_pool is None:
        await create_pool()
         
    async with db_pool.acquire() as conn:
        try:
            return await conn.fetch(sql, *args)
        except Exception as e:
            print(f"❌ Query failed: {e}")
            raise

async def check_connection():
    """Check if database connection is healthy"""
    try:
        if db_pool is None:
            return False, "Pool not initialized"
        
        async with db_pool.acquire() as conn:
            await conn.fetchval('SELECT 1')
            return True, "Connected to Railway PostgreSQL"
    except Exception as e:
        return False, str(e)