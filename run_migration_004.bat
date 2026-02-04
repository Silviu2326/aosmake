@echo off
cd /d "%~dp0"
npx psql "postgresql://postgres:postgres@localhost:5432/aos_studio" -f backend/migrations/004_add_timestamps_and_storage.sql
pause
