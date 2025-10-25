# RamSetu Health Bridge - Deployment Guide

## ✅ **MONGODB FIXED: Use This Connection String**

**Your correct MongoDB connection string:**
```
MONGO_URI=mongodb+srv://ramsetu-prod:RamSetu2024@ramsetu-db.xgiaxux.mongodb.net/ramsetu-health-bridge?appName=Ramsetu-DB
```

**Update steps:**
1. **Go to Render Dashboard → Your Service → Environment**
2. **Edit MONGO_URI variable** with the string above
3. **Save Changes → Manual Deploy → Deploy Latest Commit**
4. **Check logs** - should see "MongoDB connected" ✅

## 🚀 Quick Deployment Steps

### Prerequisites
1. Create accounts on:
   - [Vercel](https://vercel.com) (for frontends)
   - [Render](https://render.com) or [Railway](https://railway.app) (for backend)
   - [MongoDB Atlas](https://mongodb.com/atlas) (for database)

### Step 1: Deploy Backend on Render

1. **Create MongoDB Atlas Database**
   ```bash
   # Step-by-step MongoDB Atlas setup:
   # 1. Go to https://mongodb.com/atlas
   # 2. Create free account and new project
   # 3. Build a Database → M0 Sandbox (Free)
   # 4. Create a Database User (Database Access → Add New Database User)
   #    - Choose "Password" authentication
   #    - Username: ramsetu-user (or your choice)
   #    - Password: Use simple password WITHOUT special characters for now
   #    - Database User Privileges: "Atlas Admin" or "Read and write to any database"
   # 5. Add IP Address (Network Access → Add IP Address → Allow Access from Anywhere: 0.0.0.0/0)
   # 6. Connect → Drivers → Node.js → Copy connection string
   # 7. Replace <password> with your EXACT database user password
   # Example: mongodb+srv://ramsetu-user:SimplePass123@cluster0.abc123.mongodb.net/ramsetu-health-bridge
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `DBMS/ramsetu-health-bridge-main/server`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Node Version**: 18 or higher

3. **Environment Variables on Render**
   
   In Render Dashboard → Your Service → Environment → Add Environment Variable:
   
   ```
   PORT=10000
   MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/ramsetu-health-bridge
   JWT_SECRET=RamSetu2024SecureJWTKeyForProductionUse!@#$
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASS=your-16-digit-app-password
   ```
   
   **How to get each value:**
   
   - **MONGO_URI**: From MongoDB Atlas connection string (see step 1 above)
   - **JWT_SECRET**: Generate a strong 32+ character secret key
   - **EMAIL_USER**: Your Gmail address for sending notifications
   - **EMAIL_PASS**: Gmail App Password (not regular password!)

4. **Setting up Gmail App Password** (for EMAIL_PASS):
   ```bash
   # Gmail App Password Setup:
   # 1. Go to myaccount.google.com
   # 2. Security → 2-Step Verification (enable if not already)
   # 3. Security → App passwords
   # 4. Select app: Mail, Select device: Other (custom name) → "RamSetu Backend"
   # 5. Copy the 16-digit password (e.g., "abcd efgh ijkl mnop")
   # 6. Use this 16-digit code as EMAIL_PASS (no spaces)
   ```

5. **Note your Render URL** (e.g., `https://ramsetu-backend-xyz.onrender.com`)

### Step 2: Deploy Main Frontend on Vercel

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy Main Frontend**
   ```powershell
   # Navigate to main frontend
   cd "c:\Users\ACER\OneDrive\Desktop\RAMSETU_ORGAN_DONAR\DBMS\ramsetu-health-bridge-main"
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL = https://your-render-backend-url.onrender.com
     VITE_LANDING_VIDEO_URL = /videos/awareness.mp4
     VITE_DONOR_VIDEO_URL = /videos/awareness.mp4
     ```

4. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

### Step 3: Deploy Admin Frontend on Vercel

1. **Deploy Admin Frontend**
   ```powershell
   # Navigate to admin frontend
   cd "c:\Users\ACER\OneDrive\Desktop\RAMSETU_ORGAN_DONAR\DBMS\ramsetu-health-bridge-main\Admin\admin-frontend"
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Add in Vercel Dashboard:
     ```
     VITE_API_URL = https://your-render-backend-url.onrender.com/api
     ```

3. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

### Step 4: Update Backend CORS

1. **Update CORS in server/index.js** (already done):
   ```javascript
   app.use(cors({
     origin: [
       "http://localhost:8080", 
       "http://localhost:5173",
       "https://your-frontend.vercel.app",    // Your main frontend URL
       "https://your-admin.vercel.app"       // Your admin frontend URL
     ],
     credentials: true
   }));
   ```

2. **Redeploy backend on Render**

### Step 5: Test Your Deployment

1. **Main Frontend**: Visit your Vercel main app URL
2. **Admin Frontend**: Visit your Vercel admin app URL
3. **Backend**: Test API endpoints at your Render URL

## 🔧 Alternative: All on Vercel (Advanced)

If you want everything on Vercel (requires code changes):

### Backend as Serverless Functions

1. **Install serverless-http**
   ```powershell
   cd "c:\Users\ACER\OneDrive\Desktop\RAMSETU_ORGAN_DONAR\DBMS\ramsetu-health-bridge-main\server"
   npm install serverless-http
   ```

2. **Create API handler** (create `api/index.js` in project root)
3. **Move file uploads to Cloudinary/S3** (Vercel filesystem is ephemeral)
4. **Update vercel.json** to handle API routes

## � Security & Environment Variables Guide

### **Generate Strong JWT Secret**
```powershell
# Generate a secure JWT secret (run in PowerShell):
[System.Web.Security.Membership]::GeneratePassword(32, 8)
# Or use online generator: https://randomkeygen.com/
```

### **Example Environment Variables (Replace with real values)**
```env
# ✅ GOOD Examples:
MONGO_URI=mongodb+srv://ramsetu-prod:Xy9$mK2#vN8p@cluster0.abc123.mongodb.net/ramsetu-health-bridge
JWT_SECRET=RamSetu2024$ecur3JWTk3yF0rPr0duct10n!@#
EMAIL_USER=ramsetu.notifications@gmail.com
EMAIL_PASS=abcdefghijklmnop

# ❌ BAD Examples (Don't use these):
JWT_SECRET=123456
EMAIL_PASS=your-gmail-password
MONGO_URI=mongodb://localhost:27017/ramsetu
```

## �🚨 Important Notes

1. **File Uploads**: Your current backend saves files to `/uploads` folder. On Render/Railway, these files are temporary. For production, consider:
   - Cloudinary (for images)
   - AWS S3 (for documents)
   - Vercel Blob (if using Vercel serverless)

2. **Environment Security**: Never commit `.env` files. Use platform environment variables.

3. **Database**: Use MongoDB Atlas (cloud) instead of local MongoDB.

4. **Domain**: Update CORS origins with your actual Vercel domains after deployment.

## 📞 Troubleshooting

### **MongoDB Authentication Failed (Code 8000)**
If you see "bad auth : authentication failed":

1. **Check MongoDB Atlas Database User**:
   ```bash
   # Go to MongoDB Atlas → Database Access
   # Verify your database user exists and password is correct
   # If unsure, delete and create a new database user
   ```

2. **Verify Connection String Format**:
   ```bash
   # Correct format:
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE_NAME
   
   # Common mistakes:
   # ❌ Wrong: mongodb+srv://USERNAME@cluster0.xxxxx.mongodb.net/DATABASE_NAME
   # ❌ Wrong: mongodb+srv://USERNAME:@cluster0.xxxxx.mongodb.net/DATABASE_NAME  
   # ❌ Wrong: Special characters in password not URL-encoded
   ```

3. **Password with Special Characters**:
   ```bash
   # If password has special characters, URL-encode them:
   # @ becomes %40
   # # becomes %23
   # $ becomes %24
   # % becomes %25
   # Example: If password is "Pass@123#", use "Pass%40123%23"
   ```

4. **Network Access**:
   ```bash
   # MongoDB Atlas → Network Access
   # Add IP Address: 0.0.0.0/0 (Allow access from anywhere)
   # This is required for Render deployment
   ```

### **Other Common Issues**
- **CORS errors**: Update backend CORS with exact Vercel URLs
- **API not found**: Check VITE_API_URL environment variable
- **Build fails**: Ensure all dependencies are in package.json
- **File uploads fail**: Implement cloud storage solution

## 🎯 Production Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed on Render with environment variables
- [ ] Main frontend deployed on Vercel with VITE_API_URL
- [ ] Admin frontend deployed on Vercel with VITE_API_URL  
- [ ] CORS updated with production URLs
- [ ] File uploads working (or cloud storage implemented)
- [ ] All features tested in production