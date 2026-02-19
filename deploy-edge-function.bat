@echo off
REM تثبيت Supabase CLI ونشر edge function

echo ===================================
echo تثبيت Supabase CLI
echo ===================================

REM تثبيت باستخدام npm
npm install -g supabase

echo.
echo ===================================
echo نشر edge function
echo ===================================

cd /d "%~dp0"
supabase functions deploy ai-chat

echo.
echo ===================================
echo تم!
echo ===================================
pause
