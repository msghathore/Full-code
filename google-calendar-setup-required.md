# Google Calendar API Setup Required

## 🚨 CRITICAL: Google Calendar API Key Missing

Your booking system is **99% complete** but needs the Google Calendar API key to enable real-time availability checking.

## Required Environment Variable
Add this to your `.env` file:
```
VITE_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key_here
```

## How to Get Google Calendar API Key:

### Step 1: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google Calendar API"

### Step 2: Create API Key
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Add it to your `.env` file

### Step 3: Configure API Key Restrictions (Recommended)
1. In Google Cloud Console, edit your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain: `*.yourdomain.com/*`
4. Under "API restrictions", select "Google Calendar API"

### Step 4: Add to Environment
```bash
VITE_GOOGLE_CALENDAR_API_KEY=AIzaSyYourActualApiKeyHere
```

## Current Status:
- ✅ Backend booking system: WORKING
- ✅ Database integration: WORKING  
- ✅ Real-time availability hooks: READY
- ❌ **Google Calendar API: MISSING**

## Next Steps:
1. Get Google Calendar API key from Google Cloud Console
2. Add `VITE_GOOGLE_CALENDAR_API_KEY` to `.env` file
3. Restart your development server: `npm run dev`
4. Test booking flow - real-time availability will work!

## Alternative (If No API Key):
The system will still work with mock availability data, but won't show real-time staff calendar availability.