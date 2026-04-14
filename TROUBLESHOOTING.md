# 🔧 Troubleshooting: Registration Failed

## Step-by-Step Fix Guide

### **STEP 1: Check if Backend Server is Running**

Open a **NEW terminal/command prompt** and check:

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000
```

**Expected Output:**
- If you see output, backend is running ✅
- If no output, backend is NOT running ❌

**If backend is NOT running:**

1. Open a new terminal window
2. Navigate to project folder:
   ```bash
   cd C:\Users\hp\OneDrive\Desktop\PRO
   ```
3. Start backend:
   ```bash
   npm run server
   ```

**You should see:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

### **STEP 2: Check if MongoDB is Connected**

In the backend terminal, look for:
- ✅ `✅ MongoDB Connected Successfully` = MongoDB is connected
- ❌ `❌ MongoDB Connection Error:` = MongoDB is NOT connected

**If MongoDB is NOT connected:**

#### Option A: Local MongoDB
1. **Windows:**
   - Press `Win + R`
   - Type `services.msc`
   - Find "MongoDB" service
   - Right-click → Start

2. **Mac/Linux:**
   ```bash
   sudo systemctl start mongod
   # OR
   brew services start mongodb-community
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Check your `.env` file has correct connection string
2. Make sure your IP is whitelisted in Atlas
3. Verify username/password are correct

---

### **STEP 3: Verify .env File**

Check your `.env` file exists and has correct content:

**Location:** `C:\Users\hp\OneDrive\Desktop\PRO\.env`

**Content should be:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fir_management
JWT_SECRET=my_super_secret_jwt_key_12345
NODE_ENV=development
```

**For MongoDB Atlas, use:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fir_management?retryWrites=true&w=majority
JWT_SECRET=my_super_secret_jwt_key_12345
NODE_ENV=development
```

---

### **STEP 4: Check Browser Console for Errors**

1. Open your browser (Chrome/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Try registering again
5. Look for error messages

**Common Errors:**

**Error: "Network Error" or "ERR_CONNECTION_REFUSED"**
- **Solution:** Backend server is not running (see Step 1)

**Error: "Cannot POST /api/auth/register"**
- **Solution:** Backend routes not loaded properly, restart backend

**Error: "MongoServerError"**
- **Solution:** MongoDB connection issue (see Step 2)

---

### **STEP 5: Test Backend API Directly**

Open a new terminal and test if backend is responding:

```bash
# Test health endpoint
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{"status":"OK","message":"FIR Management System API is running"}
```

**If this fails:**
- Backend is not running
- Restart backend server

---

### **STEP 6: Check Frontend API URL**

Open browser console (F12) and check:

1. Go to **Network** tab
2. Try registering
3. Look for the request to `/api/auth/register`
4. Check if it's going to `http://localhost:5000/api/auth/register`

**If URL is wrong:**
- Check `client/src/context/AuthContext.js`
- Line 15 should be: `const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';`

---

### **STEP 7: Complete Setup Checklist**

Run through this checklist:

- [ ] Node.js installed (`node --version` works)
- [ ] All dependencies installed (`npm install` completed)
- [ ] `.env` file exists in root folder
- [ ] MongoDB is running (local) or Atlas connection works
- [ ] Backend server is running (port 5000)
- [ ] Frontend is running (port 3000)
- [ ] No errors in backend terminal
- [ ] No errors in frontend terminal
- [ ] Browser console shows no network errors

---

## 🚀 Proper Startup Sequence

### **Terminal 1: Backend Server**
```bash
cd C:\Users\hp\OneDrive\Desktop\PRO
npm run server
```

**Wait for:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

### **Terminal 2: Frontend**
```bash
cd C:\Users\hp\OneDrive\Desktop\PRO
npm run client
```

**Wait for:**
```
Compiled successfully!
```

### **OR Use Single Command (Both Together):**
```bash
cd C:\Users\hp\OneDrive\Desktop\PRO
npm run dev
```

---

## 🔍 Detailed Error Messages

### **"Registration failed" (Generic)**
- Check browser console (F12) for actual error
- Check backend terminal for error logs
- Verify all steps above

### **"User already exists with this email"**
- Try with a different email
- Or delete existing user from database

### **"Name is required" / "Email is required"**
- Fill all required fields in registration form
- Check form validation

### **"Cannot connect to server"**
- Backend is not running
- Start backend: `npm run server`

### **"MongoDB Connection Error"**
- MongoDB is not running
- Check MongoDB service
- Verify connection string in `.env`

---

## 🎯 Quick Test Commands

### Test Backend:
```bash
# In browser or Postman
GET http://localhost:5000/api/health
```

### Test MongoDB Connection:
```bash
# In terminal
mongosh
# OR
mongo
# Then type: show dbs
```

### Test Registration Endpoint:
```bash
# Using curl (if installed)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"123456\",\"phone\":\"1234567890\"}"
```

---

## 📝 Common Issues & Solutions

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue 2: Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd C:\Users\hp\OneDrive\Desktop\PRO
npm install
```

### Issue 3: CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Check `server/index.js` has `app.use(cors());`
- Restart backend server

### Issue 4: Validation Errors
**Error:** Shows specific field errors

**Solution:**
- Fill all required fields
- Email must be valid format
- Password must be at least 6 characters
- Phone number is required

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Terminal:**
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**Frontend Terminal:**
```
Compiled successfully!
webpack compiled with 0 warnings
```

**Browser:**
- Registration form loads
- No console errors
- Registration succeeds
- Redirects to dashboard

---

## 🆘 Still Having Issues?

1. **Check all terminal windows** - Both backend and frontend should be running
2. **Check browser console** (F12) - Look for specific error messages
3. **Check backend terminal** - Look for error logs
4. **Verify MongoDB** - Make sure it's running and accessible
5. **Restart everything:**
   - Stop all terminals (Ctrl+C)
   - Restart MongoDB
   - Run `npm run dev` again

---

**Need more help?** Check the error message in browser console (F12 → Console tab) and share it for specific assistance.


