# Photoshop MCP Proxy Server - Quick Start Guide

## START THE PROXY SERVER

Open Command Prompt and run:

```
node C:\Users\Ghath\OneDrive\Desktop\adb-mcp\adb-proxy-socket\proxy.js
```

---

## SUCCESS OUTPUT

When working correctly, you will see:

```
adb-mcp Command proxy server running on ws://localhost:3001
User connected: [ID]
Client [ID] registered for application: photoshop
```

---

## COMPLETE STARTUP CHECKLIST

1. Open Command Prompt
2. Run: `node C:\Users\Ghath\OneDrive\Desktop\adb-mcp\adb-proxy-socket\proxy.js`
3. Keep Command Prompt window open (proxy must stay running)
4. Open Adobe Photoshop
5. In Photoshop: Plugins > Photoshop MCP Agent > Photoshop MCP Agent
6. Click "Connect" in the plugin panel
7. Claude can now control Photoshop

---

## TROUBLESHOOTING

### Proxy won't start
- Make sure Node.js is installed
- Check the path is correct

### Plugin not connecting
1. Open UXP Developer Tools (from Creative Cloud)
2. File > Add Plugin
3. Select: `C:\Users\Ghath\OneDrive\Desktop\adb-mcp\uxp\ps\manifest.json`
4. Click Load
5. Then connect in Photoshop

### Connection timeout in Claude
- Make sure proxy server is running (Command Prompt window open)
- Make sure Photoshop plugin shows "Connected"
- Restart proxy and reconnect plugin if needed

---

## IMPORTANT

- The Command Prompt window must stay open while using Photoshop with Claude
- If you close it, the connection will break
- You need to restart the proxy each time you restart your computer

---

*Last verified working: December 2024*
