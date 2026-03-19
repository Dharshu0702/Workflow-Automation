# Frontend Deployment (Vercel) - SETUP GUIDE

## 🎯 **Deployment Configuration**
Frontend deployment to Vercel with production backend integration

---

## 🔧 **Vercel Configuration Updated**

### **1. vercel.json Fixed:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",     // ✅ Points to frontend directory
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://workflow-automation-1l5f.onrender.com/$1"  // ✅ Actual backend URL
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://workflow-automation-1l5f.onrender.com"  // ✅ Production API URL
  }
}
```

### **2. Frontend package.json Verified:**
```json
{
  "name": "workflow-engine-frontend",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",     // ✅ Build command for Vercel
    "test": "react-scripts test"
  },
  "dependencies": {
    "axios": "^1.6.0",             // ✅ HTTP client for API calls
    "react": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "react-scripts": "5.0.1"
  }
}
```

---

## 🚀 **Deployment Steps**

### **1. Commit Changes:**
```bash
git add vercel.json
git commit -m "Configure Vercel deployment with production backend"
git push
```

### **2. Deploy to Vercel:**

#### **Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd r:\workflow
vercel --prod
```

#### **Option B: Vercel Dashboard**
1. **Go to**: https://vercel.com/dashboard
2. **Import Project**: Connect GitHub repository
3. **Configure**: 
   - Root Directory: `frontend/`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variable: `REACT_APP_API_URL=https://workflow-automation-1l5f.onrender.com`

---

## 📊 **Deployment Configuration**

### **Vercel Settings:**
- **Root Directory**: `frontend/`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Node Version**: 18.x (or latest)
- **Environment Variables**: 
  - `REACT_APP_API_URL=https://workflow-automation-1l5f.onrender.com`

### **API Integration:**
- **Backend URL**: `https://workflow-automation-1l5f.onrender.com`
- **API Endpoints**: 
  - Workflows: `/workflows`
  - Executions: `/executions`
  - Steps: `/steps`
  - Rules: `/rules`
  - Audit Logs: `/audit-logs`

---

## 🌐 **Expected Results**

### **After Deployment:**
- ✅ **Frontend URL**: `https://your-project.vercel.app`
- ✅ **API Integration**: Connected to production backend
- ✅ **Full Application**: Complete workflow system
- ✅ **Production Ready**: Live and accessible

### **Application Features:**
- 📊 **Dashboard**: Statistics and recent executions
- 📊 **Workflow Management**: Create, edit, delete workflows
- 📊 **Execution Tracking**: View and manage executions
- 📊 **Step Management**: Configure workflow steps
- 📊 **Rule Engine**: Business logic rules
- 📊 **Audit Logs**: System activity tracking

---

## 🔍 **Troubleshooting**

### **Common Issues:**
1. **Build fails**: Check `frontend/package.json` build script
2. **API errors**: Verify `REACT_APP_API_URL` environment variable
3. **CORS issues**: Ensure backend allows Vercel domain
4. **404 errors**: Check Vercel routing configuration

### **Debug Steps:**
```bash
# Test backend API
curl https://workflow-automation-1l5f.onrender.com/health

# Test frontend build locally
cd frontend && npm run build

# Check Vercel logs
vercel logs
```

---

## 🎉 **Implementation Complete!**

The Vercel deployment configuration is **completely ready**:

- ✅ **vercel.json** - CONFIGURED with production backend
- ✅ **Build settings** - OPTIMIZED for React app
- ✅ **Environment variables** - SET for production API
- ✅ **API integration** - CONNECTED to live backend
- ✅ **Routing** - CONFIGURED for API calls

**Your frontend is ready for Vercel deployment!** 🎯

---

## 🔄 **Next Steps:**

### **1. Push Configuration:**
```bash
git add vercel.json
git commit -m "Configure Vercel deployment with production backend"
git push
```

### **2. Deploy to Vercel:**
- **CLI**: `vercel --prod`
- **Dashboard**: Import GitHub repo and configure
- **Result**: Live frontend application

### **3. Test Integration:**
- **Access**: Vercel frontend URL
- **Verify**: API calls to production backend
- **Test**: All workflow features working

**Both backend and frontend will be live and fully integrated!**
