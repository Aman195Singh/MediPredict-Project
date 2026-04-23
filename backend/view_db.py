"""Quick script to view all data in the SQLite database."""
import sqlite3
import os

os.chdir(os.path.dirname(__file__))
conn = sqlite3.connect("medipredict.db")
c = conn.cursor()

# Show tables
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in c.fetchall()]
print("TABLES IN DATABASE:", tables)
print("=" * 50)

for table in tables:
    print(f"\nTABLE: {table}")
    print("-" * 50)
    
    # Column names
    c.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in c.fetchall()]
    print(f"Columns: {columns}")
    
    # Data
    c.execute(f"SELECT * FROM {table}")
    rows = c.fetchall()
    if rows:
        for row in rows:
            print(f"  {row}")
    else:
        print("  (empty - no data yet)")

conn.close()
print("\n" + "=" * 50)
print("Done! This is all data in medipredict.db")
