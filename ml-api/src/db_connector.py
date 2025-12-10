# ml-api/src/db_connector.py
import asyncpg
import os
from urllib.parse import urlparse

# Ambil DATABASE_URL dari environment variables
DATABASE_URL = os.environ.get('DATABASE_URL')

db_pool = None

async def create_pool():
    global db_pool
    if db_pool is not None:
        return db_pool

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set.")

    # Mengurai DATABASE_URL
    url = urlparse(DATABASE_URL)
    
    # Pastikan skema koneksi adalah 'postgres' atau 'postgresql'
    if url.scheme not in ['postgres', 'postgresql']:
        raise ValueError("Unsupported database scheme in DATABASE_URL.")

    DB_CONFIG = {
        'user': url.username,
        'password': url.password,
        'database': url.path.lstrip('/'),  # Menghapus '/' di awal path
        'host': url.hostname,
        'port': url.port or 5432, # Gunakan port default 5432 jika tidak dispesifikasi
    }
    
    db_pool = await asyncpg.create_pool(**DB_CONFIG)
    return db_pool

async def execute_query(sql: str, *args):
    """Fungsi pembantu untuk menjalankan kueri di pool."""
    if db_pool is None:
         # Pastikan pool sudah dibuat sebelum digunakan
         await create_pool() 
         
    async with db_pool.acquire() as conn:
        # fetch() digunakan untuk kueri SELECT, execute() untuk INSERT/UPDATE
        # Kita gunakan fetch() karena lebih umum, tapi perlu dikonfirmasi
        return await conn.fetch(sql, *args)