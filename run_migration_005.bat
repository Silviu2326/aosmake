@echo off
echo ============================================
echo Running Migration 005: Instantly Stock
echo ============================================
echo.

cd /d "%~dp0"
cd backend

echo Ejecutando migracion en PostgreSQL...
psql -U postgres -d aos_studio -f migrations/005_add_instantly_stock.sql

echo.
echo ============================================
echo Migration 005 completed!
echo ============================================
echo.
echo El nuevo estado 'stock' esta ahora disponible.
echo Los leads HIT pueden enviarse a "Instantly Stock"
echo y luego enviarse a "Instantly" cuando quieras.
echo.

pause
