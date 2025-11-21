# Staff Dashboard - Setup & Usage Guide

## 🚀 Quick Setup

The staff dashboard is now live and ready to use! Here's how to access it:

### **Access URL**
Navigate to: `http://localhost:8080/staff`

### **Staff Passcode**
**Passcode: `SALON2024`**

> **Important**: You can change this passcode by editing line 12 in `src/pages/StaffDashboard.tsx`

---

## ✨ Features Overview

### **1. Passcode Protection**
- Simple 8-digit passcode for secure access
- No complex login system needed
- Quick logout functionality

### **2. Real-time Dashboard**
- Shows **today's appointments** in chronological order
- Auto-refreshes every **30 seconds**
- Real-time updates via Supabase subscriptions
- Manual refresh button

### **3. Customer Information**
- **Customer name** and contact details
- **Service type** and duration
- **Appointment time** and staff assigned
- **Price** information
- **Special notes** from bookings

### **4. Status Tracking**
Real-time status indicators with color coding:
- 🟦 **Confirmed** (Blue) - Booking confirmed
- 🟢 **Arrived** (Green) - Customer has arrived
- 🟡 **In Progress** (Yellow) - Service started
- 🟣 **Completed** (Purple) - Service finished
- 🔴 **Cancelled** (Red) - Appointment cancelled

### **5. Quick Actions**
One-click status updates:
- **"Arrived"** - Mark customer as arrived
- **"Start"** - Begin the service
- **"Complete"** - Mark service as finished
- **"Cancel"** - Cancel appointment if needed

### **6. Mobile-Friendly Design**
- **Responsive layout** for tablets and phones
- **Touch-friendly buttons**
- **Optimized for salon staff mobility**

---

## 📱 How to Use

### **For Salon Staff:**

1. **Open the dashboard** on any device (phone, tablet, computer)
2. **Enter the passcode**: `SALON2024`
3. **View today's appointments** - automatically sorted by time
4. **Update customer status** with one click:
   - When customer arrives → Click "Arrived"
   - When starting service → Click "Start"
   - When service completes → Click "Complete"

### **For Management:**

- **Share the URL and passcode** with trusted staff
- **Monitor real-time activity** across multiple devices
- **No training required** - intuitive interface

---

## 🔧 Customization Options

### **Change Passcode**
Edit line 12 in `src/pages/StaffDashboard.tsx`:
```typescript
const STAFF_PASSCODE = 'YOUR_NEW_PASSCODE';
```

### **Update Refresh Interval**
Edit line 31 in `src/pages/StaffDashboard.tsx`:
```typescript
refreshIntervalRef.current = setInterval(fetchAppointments, 30000); // 30 seconds
```

### **Add More Status Options**
The dashboard supports any status values in the database. Simply update the status in the database and it will appear automatically.

---

## 🗃️ Database Integration

The dashboard connects directly to your existing **Supabase database**:

- **Table**: `appointments`
- **Real-time updates** via Supabase subscriptions
- **Joins** with `services` and `staff` tables for complete information
- **Automatic status updates** reflected in the database

---

## 🎯 Perfect for Salon Workflows

### **Typical Day Flow:**
1. **Morning**: Staff logs in, reviews today's schedule
2. **Customer Arrival**: Click "Arrived" when customer checks in
3. **Service Start**: Click "Start" when beginning the service
4. **Service Complete**: Click "Complete" when finished
5. **End of Day**: Dashboard shows completion status for all appointments

### **Benefits:**
- ✅ **Instant visibility** of all appointments
- ✅ **No phone calls** needed for status updates
- ✅ **Mobile access** from anywhere in the salon
- ✅ **Real-time synchronization** across devices
- ✅ **Professional appearance** for customers

---

## 🚀 Deployment

### **For Production:**
1. Deploy your app to your hosting service
2. Update the environment variables
3. Staff can access via: `your-domain.com/staff`
4. Same passcode works across all environments

---

## 🛡️ Security Features

- **Passcode Protection** - Simple but effective access control
- **No Admin Privileges** - Staff can only view and update appointment statuses
- **Session Management** - Automatic logout protection
- **Database Security** - Uses Supabase Row Level Security

---

## 💡 Tips for Maximum Use

1. **Bookmark the URL** on staff devices for quick access
2. **Use landscape mode** on tablets for better appointment viewing
3. **Keep the dashboard open** during busy periods for instant updates
4. **Train staff** on the simple one-click status updates
5. **Monitor real-time** from management devices

---

## 📞 Support

The dashboard is built on your existing infrastructure and should work seamlessly with:
- ✅ Current booking system
- ✅ Existing database structure
- ✅ Current Supabase setup
- ✅ All devices (desktop, tablet, mobile)

**Ready to use immediately** - no additional setup required!