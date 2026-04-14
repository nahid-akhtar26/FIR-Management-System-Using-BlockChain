# 🚀 How to Run the Blockchain-Based FIR Management System

This guide will help you set up and run the application step by step.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning the repository)

## 🔧 Installation Steps

### Step 1: Install Dependencies

Open your terminal/command prompt in the project root directory and run:

```bash
# Install all dependencies (both server and client)
npm run install-all

# OR install separately:
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Navigate to server directory
cd server

# Create .env file (Windows)
type nul > .env

# Create .env file (Mac/Linux)
touch .env
```

Add the following content to the `.env` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fir_management

# JWT Secret (change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port (default: 5000)
PORT=5000

# Node Environment
NODE_ENV=development
```

**Note:** 
- If using MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string
- Change `JWT_SECRET` to a secure random string in production

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Mac/Linux
sudo mongod

# Or if MongoDB is installed as a service, it should start automatically
```

**Option B: MongoDB Atlas (Cloud)**
- No local setup needed
- Just use your Atlas connection string in `.env`

### Step 4: Run the Application

You have two options to run the application:

#### Option A: Run Both Server and Client Together (Recommended)

From the project root directory:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

#### Option B: Run Separately

**Terminal 1 - Start Backend Server:**
```bash
npm run server
# OR
cd server
node index.js
```

**Terminal 2 - Start Frontend Client:**
```bash
npm run client
# OR
cd client
npm start
```

## 🌐 Access the Application

Once both servers are running:

1. **Frontend (User Interface):** Open your browser and go to:
   ```
   http://localhost:3000
   ```

2. **Backend API:** The API will be available at:
   ```
   http://localhost:5000
   ```

3. **API Health Check:** Test if the backend is running:
   ```
   http://localhost:5000/api/health
   ```

## 👤 Default Test Accounts

After running the application, you can:

1. **Register a new account** via the registration page
2. **Login with OTP** - The OTP will be displayed in the server console (for development)
3. **Login with password** - Use the credentials you registered with

### Creating Test Accounts

1. Go to `http://localhost:3000/register`
2. Fill in the registration form
3. Choose your role (User, Officer, or Admin)
4. Register with either:
   - **Password method**: Enter password and confirm password
   - **OTP method**: Enter email/phone, click "Send OTP", check server console for OTP, enter OTP to verify

## 🔐 OTP Login Feature

### How OTP Works:

1. **Send OTP:**
   - Enter your email or phone number
   - Click "Send OTP"
   - **In development**, the OTP will be displayed in the server console
   - **In production**, OTP will be sent via SMS/Email (requires SMS/Email service integration)

2. **Verify OTP:**
   - Enter the 6-digit OTP you received
   - Click "Verify & Login"
   - You'll be logged in automatically

### OTP Console Output Example:
```
📱 OTP for user@example.com: 123456 (Valid for 5 minutes)
```

## 🛠️ Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

### Issue: Port Already in Use

**Solution:**
- Change the port in `.env` file (for backend)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill
  ```

### Issue: Dependencies Not Installing

**Solution:**
- Delete `node_modules` folders and `package-lock.json`
- Run `npm install` again
- Make sure you have Node.js v14 or higher

### Issue: OTP Not Received

**Solution:**
- In development, check the server console for OTP
- Make sure the server is running
- Check browser console for errors

### Issue: CORS Errors

**Solution:**
- Make sure backend is running on port 5000
- Check `server/index.js` for CORS configuration
- Ensure frontend is making requests to correct API URL

## 📱 Available Features

### User Portal:
- ✅ Register/Login (Password or OTP)
- ✅ File New FIR with evidence upload
- ✅ Track FIR status
- ✅ Download FIR reports
- ✅ Chatbot assistance
- ✅ Multi-language support
- ✅ Dark/Light mode

### Officer Portal:
- ✅ Review pending FIRs
- ✅ Approve/Reject FIRs
- ✅ Blockchain validation
- ✅ Manage active cases
- ✅ Upload investigation results
- ✅ Close cases and generate reports

### Admin Portal:
- ✅ Manage users and officers
- ✅ Monitor FIR workflow
- ✅ System health monitoring
- ✅ Blockchain configuration
- ✅ Generate system reports

## 🔄 Development Workflow

1. **Make changes** to code
2. **Save files** - React will auto-reload (hot reload)
3. **Backend changes** - Restart server manually:
   ```bash
   # Stop server (Ctrl+C)
   # Restart
   npm run server
   ```

## 📦 Build for Production

### Build Frontend:
```bash
cd client
npm run build
```

### Start Production Server:
```bash
cd server
NODE_ENV=production node index.js
```

## 🆘 Need Help?

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check that ports 3000 and 5000 are available
5. Review the troubleshooting section above

## 📝 Notes

- **OTP in Development**: OTPs are logged to console for testing
- **OTP in Production**: Integrate with SMS gateway (Twilio, AWS SNS) or Email service (SendGrid, AWS SES)
- **Database**: All data is stored in MongoDB
- **Authentication**: JWT tokens are used for authentication
- **Blockchain**: Currently uses simulated blockchain hashing (integrate real blockchain in production)

## ✅ Quick Start Checklist

- [ ] Node.js installed
- [ ] MongoDB installed and running
- [ ] Dependencies installed (`npm run install-all`)
- [ ] `.env` file created with correct values
- [ ] Backend server running (`npm run server`)
- [ ] Frontend client running (`npm run client`)
- [ ] Browser opened to `http://localhost:3000`

---

**Happy Coding! 🎉**
