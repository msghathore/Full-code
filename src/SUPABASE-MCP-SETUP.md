# 🚀 SUPABASE MCP SERVER SETUP

## ✅ Official Supabase MCP Server Configuration

Great news! Supabase has an official MCP server. Let's configure it properly:

## 📋 Step 1: Find Your MCP Settings File

The MCP settings file is typically located at:
`C:\Users\Ghath\AppData\Roaming\Code\User\globalStorage\rooveterinaryinc.roo-cline\settings\mcp_settings.json`

## 📋 Step 2: Update Your MCP Settings

Replace the content with this configuration:

```json
{
  "mcpServers": {
    "supabase-zavira": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server", "--project-ref", "stppkvkcjsyusxwtbaej"],
      "env": {
        "SUPABASE_URL": "https://stppkvkcjsyusxwtbaej.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjk4MTUsImV4cCI6MjA3ODgwNTgxNX0.sH9es8xu2tZlkhQrfaPcaYTAC8t6CjrI7LL9BKfT-v0",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cHBrdmtjanN5dXN4d3RiYWVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIyOTgxNSwiZXhwIjoyMDc4ODA1ODE1fQ.aJkalSFfhhYse4YwSLR6Dzl58Dpycs8QHEKCFmAZ4vw"
      }
    }
  }
}
```

## 📋 Step 3: Restart Your MCP Client

After updating the settings file, restart your MCP client to load the new server.

## 🎯 What This Will Give You

With the official Supabase MCP server configured, I'll be able to:

✅ **Direct Database Access:**
- List all tables in your database
- Execute SQL queries
- Read/write data from your tables

✅ **Slot Action System Support:**
- Access your `waitlists` table
- Access your `staff_availability` table  
- Access your enhanced `appointments` table with new columns

✅ **Real-time Database Management:**
- Query data from your Slot Action Popover Menu system
- Test and verify the functionality we just built
- Make database changes as needed

## 🔍 Test Commands

Once configured, you can ask me to:
- "Show me all tables in your Supabase database"
- "Query the waitlists table to see current entries"
- "Check the appointments table structure"
- "Test the Slot Action Menu database functions"

This is much more reliable than a custom MCP server! 🎉