@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   ZAVIRA Email System - Auto Deploy
echo ========================================
echo.

REM Check if SUPABASE_ACCESS_TOKEN is set
if "%SUPABASE_ACCESS_TOKEN%"=="" (
    echo ERROR: SUPABASE_ACCESS_TOKEN not set!
    echo.
    echo Quick Setup:
    echo 1. Go to: https://supabase.com/dashboard/account/tokens
    echo 2. Click "Generate new token"
    echo 3. Copy the token
    echo 4. Run: set SUPABASE_ACCESS_TOKEN=your-token-here
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo [1/4] Linking to Supabase project...
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr
if errorlevel 1 (
    echo ERROR: Failed to link project
    pause
    exit /b 1
)

echo.
echo [2/4] Deploying Brevo email service...
npx supabase functions deploy brevo-service
if errorlevel 1 (
    echo ERROR: Failed to deploy brevo-service
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying reminder function...
npx supabase functions deploy send-appointment-reminders
if errorlevel 1 (
    echo ERROR: Failed to deploy send-appointment-reminders
    pause
    exit /b 1
)

echo.
echo [4/4] Applying database migration...
echo Running SQL migration...

REM Use Supabase REST API to execute SQL
curl -X POST "https://jcbqrmxiwahtbugbdtqr.supabase.co/rest/v1/rpc" ^
  -H "apikey: %SUPABASE_ANON_KEY%" ^
  -H "Authorization: Bearer %SUPABASE_ACCESS_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE; CREATE INDEX IF NOT EXISTS idx_appointments_reminder_lookup ON appointments(appointment_date, status, reminder_sent) WHERE status IN ('confirmed', 'accepted') AND reminder_sent = FALSE;\"}"

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo What was deployed:
echo  - Brevo email service (staff notifications, reminders)
echo  - Automated reminder function
echo  - Database migration (reminder_sent column)
echo.
echo Next step:
echo  Setup cron job at: https://supabase.com/dashboard/project/jcbqrmxiwahtbugbdtqr/functions/send-appointment-reminders
echo  Schedule: 0 9 * * *
echo  Timezone: America/Winnipeg
echo.
echo DONE! Press any key to exit.
pause
