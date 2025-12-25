@echo off
echo ===============================================
echo  ZAVIRA Email Notifications - Deployment
echo ===============================================
echo.

echo Step 1: Logging in to Supabase...
echo (Your browser will open - please login)
echo.
npx supabase login
if errorlevel 1 (
    echo ERROR: Login failed
    pause
    exit /b 1
)

echo.
echo Step 2: Linking to project...
echo.
npx supabase link --project-ref jcbqrmxiwahtbugbdtqr
if errorlevel 1 (
    echo ERROR: Link failed
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying Brevo service...
echo.
npx supabase functions deploy brevo-service
if errorlevel 1 (
    echo ERROR: Brevo service deployment failed
    pause
    exit /b 1
)

echo.
echo Step 4: Deploying reminder function...
echo.
npx supabase functions deploy send-appointment-reminders
if errorlevel 1 (
    echo ERROR: Reminder function deployment failed
    pause
    exit /b 1
)

echo.
echo ===============================================
echo  Edge Functions Deployed Successfully!
echo ===============================================
echo.
echo Next steps:
echo 1. Apply database migration (see DEPLOY_NOW.md Step 1)
echo 2. Set up cron job (see DEPLOY_NOW.md Step 3)
echo.
echo Opening deployment guide in browser...
start DEPLOY_NOW.md

pause
