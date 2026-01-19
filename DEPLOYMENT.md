# Document Flow - Deployment Guide

## Prerequisites
- Node.js installed
- MongoDB database (local or cloud)
- Environment variables configured

## Environment Setup

### Backend (.env in server/)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Email Configuration (for OTP and Password Reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@docflow.com

# Frontend URL
CLIENT_URL=https://your-frontend-url.com
```

### Frontend (.env in client/)
```env
VITE_API_URL=https://your-backend-url.com/api
```

## Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL`
5. Deploy!

#### Backend on Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all backend env vars
5. Deploy!

### Option 2: Railway (Full Stack)

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add MongoDB database service
4. Configure environment variables
5. Deploy both frontend and backend

### Option 3: DigitalOcean App Platform

1. Go to [digitalocean.com](https://www.digitalocean.com/products/app-platform)
2. Create new app from GitHub
3. Configure components:
   - **Web Service** (Backend): Node.js, port 5000
   - **Static Site** (Frontend): Build from `client/dist`
4. Add MongoDB managed database
5. Deploy!

### Option 4: Self-Hosted (VPS)

#### Using PM2 on Ubuntu/Debian

```bash
# Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mongodb

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd document-flow

# Backend
cd server
npm install
pm2 start server.js --name docflow-api

# Frontend (serve with nginx)
cd ../client
npm install
npm run build

# Configure nginx to serve client/dist
```

## Database Setup

### MongoDB Atlas (Recommended for Cloud)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP addresses (or allow from anywhere for testing)
5. Get connection string
6. Update `MONGO_URI` in backend .env

### Local MongoDB
```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb
# or
brew services start mongodb-community

# Connection string
MONGO_URI=mongodb://localhost:27017/document-flow
```

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend can connect to backend
- [ ] MongoDB connection is working
- [ ] Email service is configured (for OTP)
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] SSL/HTTPS is enabled
- [ ] Test user registration flow
- [ ] Test document creation and forwarding
- [ ] Test password reset flow

## Quick Deploy Commands

### Build Frontend
```bash
cd client
npm install
npm run build
```

### Start Backend (Production)
```bash
cd server
npm install
NODE_ENV=production npm start
```

## Troubleshooting

### CORS Issues
Ensure `CLIENT_URL` in backend .env matches your frontend URL exactly.

### Database Connection
Check MongoDB connection string and network access settings.

### Email Not Sending
Verify email credentials and enable "Less secure app access" or use App Passwords for Gmail.

### Build Errors
Run `npm run lint` to check for code issues before building.

## Support

For issues or questions, check the application logs:
- Frontend: Browser console
- Backend: Server logs (PM2: `pm2 logs docflow-api`)
