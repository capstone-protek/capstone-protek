import asyncpg
import os

# Ambil DATABASE_URL dari environment variables
# Pastikan di Railway variable ini sudah diisi dengan Public URL
DATABASE_URL = os.environ.get('DATABASE_URL')

db_pool = None

async def create_pool():
    global db_pool
    if db_pool is not None:
        return db_pool

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set.")

    print(f"Connecting to DB...", flush=True)

    try:
        # PERBAIKAN:
        # 1. Hapus manual parsing (urlparse) yang rawan error.
        # 2. Gunakan dsn=DATABASE_URL langsung.
        # 3. Tambahkan ssl='require' karena koneksi lewat Public URL wajib aman.
        db_pool = await asyncpg.create_pool(dsn=DATABASE_URL, ssl='require')
        
        print("Database connection established successfully.", flush=True)
    except Exception as e:
        # Log error supaya ketahuan kalau ada masalah koneksi
        print(f"FATAL: Failed to connect to DB. Error: {e}", flush=True)
        # Kita raise errornya biar service restart dan tidak diam saja
        raise e

    return db_pool

async def execute_query(sql: str, *args):
    """
    Fungsi helper untuk menjalankan query SQL.
    Otomatis membuat koneksi jika belum ada.
    """
    if db_pool is None:
        await create_pool()
    
    # Gunakan acquire() untuk meminjam koneksi dari pool
    async with db_pool.acquire() as conn:
        try:
            return await conn.fetch(sql, *args)
        except Exception as e:
            print(f"Query Execution Error: {e}", flush=True)
            raise e