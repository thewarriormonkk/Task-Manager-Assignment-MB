# MERN Stack Deployment Guide

This guide will help you deploy your MERN stack application to Vercel (frontend) and Railway (backend).

## Prerequisites

- GitHub account
- Vercel account
- Railway account
- MongoDB Atlas account (for production database)

## Step 1: Prepare Your Code

### 1.1 Environment Variables

Create environment files based on the examples:

**Backend (`backend/env.example` → `backend/.env`):**

```env
MONGO_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/env.example` → `frontend/.env`):**

```env
VITE_API_URL=http://localhost:5000/api
```

### 1.2 Database Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace `<password>` with your actual password

## Step 2: Deploy Backend to Railway

### 2.1 Connect to Railway

1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select the `backend` folder

### 2.2 Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task_management
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRE=30d
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### 2.3 Deploy

1. Railway will automatically detect your Node.js app
2. It will use the `railway.json` configuration
3. Wait for deployment to complete
4. Note your Railway app URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Set the **Root Directory** to `frontend`

### 3.2 Configure Build Settings

Vercel should auto-detect Vite, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```env
VITE_API_URL=https://your-backend-domain.railway.app/api
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your Vercel app URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update CORS Configuration

### 4.1 Update Backend CORS

Go back to Railway and update the `CLIENT_URL` environment variable with your actual Vercel URL:

```env
CLIENT_URL=https://your-actual-vercel-url.vercel.app
```

Railway will automatically redeploy with the new environment variable.

## Step 5: Test Your Deployment

### 5.1 Test Backend

Visit your Railway URL + `/health`:

```
https://your-app.railway.app/health
```

You should see:

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Try to register a new user
3. Try to create a task
4. Check if everything works properly

## Step 6: Domain Configuration (Optional)

### 6.1 Custom Domain for Vercel

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Follow the DNS configuration instructions

### 6.2 Custom Domain for Railway

1. In Railway dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Update the `CLIENT_URL` environment variable accordingly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `CLIENT_URL` in Railway matches your Vercel URL exactly
2. **Database Connection**: Verify your MongoDB Atlas connection string and network access
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Failures**: Check the build logs in both Vercel and Railway dashboards

### Debugging

1. **Backend Logs**: Check Railway deployment logs
2. **Frontend Logs**: Check Vercel build logs
3. **Network Tab**: Use browser dev tools to check API calls
4. **Health Check**: Use the `/health` endpoint to verify backend is running

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **MongoDB**: Enable network access restrictions in MongoDB Atlas
3. **Environment Variables**: Never commit `.env` files to version control
4. **HTTPS**: Both Vercel and Railway provide HTTPS by default

## Monitoring

1. **Railway**: Monitor your backend performance and logs
2. **Vercel**: Monitor your frontend performance and analytics
3. **MongoDB Atlas**: Monitor your database performance

## Cost Optimization

1. **Railway**: Free tier includes 500 hours/month
2. **Vercel**: Free tier includes 100GB bandwidth/month
3. **MongoDB Atlas**: Free tier includes 512MB storage

## Support

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
