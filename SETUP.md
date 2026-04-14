# Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Install all dependencies (root + client)
npm run install-all
```

Or manually:
```bash
npm install
cd client && npm install && cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Default connection: `mongodb://localhost:27017/fir_management`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `.env` file with your connection string

### 3. Configure Environment

Create `.env` file in root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fir_management
JWT_SECRET=change_this_to_a_random_secret_key
NODE_ENV=development
```

### 4. Start the Application

```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### 5. Open Browser

Navigate to: **http://localhost:3000**

## 📝 First Steps

1. **Register a new account** at `/register`
2. **Login** with your credentials
3. **Submit your first FIR** from the dashboard
4. **Explore features**: Profile, Tracking, Chatbot, Dark Mode

## ✅ Verify Installation

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ Can register/login
- ✅ Can submit FIR
- ✅ Dark mode works
- ✅ Language switcher works

## 🐛 Common Issues

**MongoDB Connection Error**
```
Solution: Make sure MongoDB is running
Windows: Check Services > MongoDB
Mac/Linux: sudo systemctl start mongod
```

**Port Already in Use**
```
Solution: Change PORT in .env file
Or kill process using the port
```

**Module Not Found**
```
Solution: Run npm install in both root and client directories
```

**CORS Errors**
```
Solution: Check API_URL in client/src/context/AuthContext.js
Should match your backend URL
```

## 🎯 Testing the System

1. Create 2-3 test accounts
2. Submit multiple FIRs
3. Test all status filters
4. Try dark/light mode toggle
5. Switch languages
6. Use chatbot
7. Update profile
8. View FIR details

## 📚 Next Steps

- Read full README.md for detailed documentation
- Customize blockchain service for production
- Add more languages in LanguageContext.js
- Configure production environment variables

---

**Happy Coding! 🎉**

