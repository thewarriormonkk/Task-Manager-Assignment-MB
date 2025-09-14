# Deployment Checklist

## Pre-Deployment Setup

- [ ] Create MongoDB Atlas account and cluster
- [ ] Get MongoDB connection string
- [ ] Create strong JWT secret
- [ ] Test application locally
- [ ] Commit all changes to GitHub

## Backend Deployment (Railway)

- [ ] Sign up/Login to Railway
- [ ] Create new project from GitHub repo
- [ ] Select `backend` folder as root directory
- [ ] Set environment variables:
  - [ ] `MONGO_URI` (MongoDB Atlas connection string)
  - [ ] `JWT_SECRET` (strong random string)
  - [ ] `JWT_EXPIRE=30d`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `CLIENT_URL` (will be updated after frontend deployment)
- [ ] Deploy and get Railway URL
- [ ] Test health endpoint: `https://your-app.railway.app/health`

## Frontend Deployment (Vercel)

- [ ] Sign up/Login to Vercel
- [ ] Create new project from GitHub repo
- [ ] Set root directory to `frontend`
- [ ] Verify build settings:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Set environment variables:
  - [ ] `VITE_API_URL=https://your-backend-domain.railway.app/api`
- [ ] Deploy and get Vercel URL
- [ ] Test frontend application

## Post-Deployment Configuration

- [ ] Update Railway `CLIENT_URL` with actual Vercel URL
- [ ] Wait for Railway redeployment
- [ ] Test full application functionality:
  - [ ] User registration
  - [ ] User login
  - [ ] Task creation
  - [ ] Task management
  - [ ] User assignment

## Final Verification

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] API calls work from frontend
- [ ] Database operations work
- [ ] Authentication works
- [ ] CORS is properly configured

## Optional Enhancements

- [ ] Set up custom domains
- [ ] Configure monitoring
- [ ] Set up automated backups
- [ ] Implement error tracking
- [ ] Set up CI/CD pipelines
