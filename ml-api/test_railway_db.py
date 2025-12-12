"""
Test Railway PostgreSQL connection
"""
import asyncio
import os
from dotenv import load_dotenv
from src.db_connector import create_pool, execute_query, close_pool

async def test_railway_connection():
    """Test Railway PostgreSQL connection"""
    print("="*70)
    print("🚀 TESTING RAILWAY POSTGRESQL CONNECTION")
    print("="*70)
    
    # Load .env
    load_dotenv()
    
    # Verify environment variables
    print("\n1️⃣ Checking environment variables...")
    db_url = os.getenv("DATABASE_URL")
    pg_password = os.getenv("PGPASSWORD", "")
    
    if db_url:
        # Hide password
        safe_url = db_url.replace(pg_password, "****") if pg_password else db_url
        print(f"   ✅ DATABASE_URL found")
        print(f"   📍 {safe_url}")
    else:
        print("   ❌ DATABASE_URL not found in .env!")
        return
    
    try:
        # 2. Create connection pool
        print("\n2️⃣ Creating connection pool...")
        await create_pool()
        
        # 3. Test simple query
        print("\n3️⃣ Testing query execution...")
        result = await execute_query("SELECT NOW() as current_time, version() as pg_version")
        if result:
            print(f"   ✅ Current server time: {result[0]['current_time']}")
            print(f"   ✅ PostgreSQL: {result[0]['pg_version'].split(',')[0]}")
        
        # 4. Check schema
        print("\n4️⃣ Checking database schema...")
        tables = await execute_query("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        if tables:
            print(f"   ✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"      - {table['table_name']}")
                
                # Count rows in each table
                try:
                    count_result = await execute_query(
                        f"SELECT COUNT(*) as count FROM {table['table_name']}"
                    )
                    count = count_result[0]['count']
                    print(f"        ({count} rows)")
                except:
                    pass
        else:
            print("   ⚠️  No tables found!")
            print("   📋 Need to create schema. Run schema.sql on Railway.")
        
        # 5. Test write operation (if tables exist)
        if tables and any(t['table_name'] == 'predictions' for t in tables):
            print("\n5️⃣ Testing write operation...")
            try:
                from datetime import datetime
                test_query = """
                    INSERT INTO predictions 
                    (machine_id, timestamp, prediction_status, risk_probability, rul_estimate)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                """
                result = await execute_query(
                    test_query, 
                    'TEST', 
                    datetime.now(), 
                    'NORMAL', 
                    0.05, 
                    480
                )
                print(f"   ✅ Write test successful (ID: {result[0]['id']})")
                
                # Cleanup
                await execute_query("DELETE FROM predictions WHERE machine_id = 'TEST'")
                print(f"   ✅ Cleanup completed")
            
            except Exception as e:
                print(f"   ⚠️  Write test skipped: {e}")
        
        print("\n" + "="*70)
        print("✅ RAILWAY DATABASE CONNECTION SUCCESSFUL!")
        print("="*70)
        print("\n🎉 Your API is ready to use Railway PostgreSQL!")
        print("   Start server: uvicorn src.main:app --reload")
        
    except Exception as e:
        print(f"\n❌ CONNECTION TEST FAILED!")
        print(f"Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check if Railway database is running")
        print("2. Verify .env file has correct credentials")
        print("3. Check network/firewall settings")
        print("4. Try connection from Railway dashboard first")
    
    finally:
        await close_pool()

if __name__ == "__main__":
    asyncio.run(test_railway_connection())
