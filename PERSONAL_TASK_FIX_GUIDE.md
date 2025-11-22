# Personal Task Fix - Troubleshooting Guide

## The Issue
Personal tasks cannot be created because the database migration hasn't been run.

## Step 1: Run the Database Migration

**IMPORTANT**: You must run this SQL script in your Supabase project:

1. **Open your Supabase dashboard**
2. **Navigate to SQL Editor** 
3. **Copy the entire content** of `complete_personal_task_fix.sql`
4. **Paste and execute** the entire script
5. **Wait for completion** - you should see "Success" messages

## Step 2: Test the Personal Task Feature

1. **Go to the staff scheduling page** (http://localhost:8080)
2. **Log in with any staff ID** (EMP001, EMP002, etc.)
3. **Click on any empty time slot**
4. **Select "Personal Task"** from the popup menu
5. **Fill out the form**:
   - Task Description: "Test meeting"
   - Duration: "60 minutes"
   - Color: Any color
6. **Click "Block Time"**

## Expected Results

✅ **Success**: 
- Green success toast appears
- Personal task shows on calendar
- No console errors

❌ **Failure**:
- Red error toast appears
- Console shows database errors
- Task doesn't appear on calendar

## Step 3: Debug (if still not working)

If it still doesn't work, run the debug script:

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Copy and paste** the content of `debug_personal_task.js`
4. **Press Enter** to run the debug script
5. **Check the output** for specific error messages

## Common Error Messages

- `"relation \"public.personal_tasks\" does not exist"` → Run SQL migration
- `"JWT"` error → Check Supabase authentication
- `"function create_personal_task does not exist"` → Run SQL migration

## What the Fix Does

The fix updates the service functions to:
1. ✅ Use the correct `personal_tasks` table instead of `appointments`
2. ✅ Use proper parameter names for RPC functions
3. ✅ Handle missing table scenarios gracefully
4. ✅ Provide clear error messages guiding users to run the migration