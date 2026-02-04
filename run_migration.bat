@echo off
cd /d "%~dp0backend"
pip install psycopg2-binary -q
python -c "
import psycopg2
conn = psycopg2.connect('postgres://postgres:cPx8RjONU0RLGjpZ@db.dvwdxdguvzqzeckavulr.supabase.co:5432/postgres')
conn.autocommit = True
with open('migrations/001_create_leads_tables.sql', 'r') as f:
    sql = f.read()
cur = conn.cursor()
cur.execute(sql)
print('Migracion ejecutada exitosamente!')
cur.close()
conn.close()
"
pause
