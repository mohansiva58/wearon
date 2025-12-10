# Vercel Deployment Guide

## Environment Variables Setup

Your application is failing on Vercel because environment variables are not configured. Follow these steps:

### 1. Go to Vercel Dashboard
- Navigate to your project: https://vercel.com/dashboard
- Click on your project
- Go to **Settings** → **Environment Variables**

### 2. Add ALL these environment variables:

#### MongoDB
```
MONGODB_URI=mongodb+srv://rarerabbit:r%40rer%40bbit@rarerabbit.uyfrgct.mongodb.net/thehouseofrare?retryWrites=true&w=majority&appName=rarerabbit
```

#### NextAuth (IMPORTANT: Update NEXTAUTH_URL with your Vercel URL)
```
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
NEXTAUTH_URL=https://your-app-name.vercel.app
```

#### Base URL (Update with your Vercel URL)
```
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

#### Admin Credentials
```
ADMIN_EMAIL=admin@thehouseofrare.com
ADMIN_PASSWORD=Admin@12345
```

#### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dgmtezsl7
CLOUDINARY_API_KEY=416637515542875
CLOUDINARY_API_SECRET=EA3iR_dpPoWzSStRdJ9F-F7eW5Q
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

#### Razorpay
```
RAZORPAY_KEY_ID=rzp_test_RbCZ4pR7DKMosu
RAZORPAY_KEY_SECRET=nMiWN4jstzWZBJ7SarCtT9os
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RbCZ4pR7DKMosu
```

#### Email (Nodemailer)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mohan.trrev@gmail.com
EMAIL_PASS=ksrj evhp sbws frvg
```

#### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBUO87GZoz0GzwzQ_SnNnioji6VhDwQPiw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rarerabbit-a412f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://rarerabbit-a412f-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rarerabbit-a412f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rarerabbit-a412f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=666983339059
NEXT_PUBLIC_FIREBASE_APP_ID=1:666983339059:web:374783cb729b514460bf46
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4SVQQYBPQP
```

#### Redis
```
REDIS_URL=redis-16313.c73.us-east-1-2.ec2.cloud.redislabs.com:16313
REDIS_PASSWORD=5eCStXZQQ3ZDhKon1rpB19grylXRwCWt
```

#### Recommendation Service
```
USE_RECOMMENDATION_MICROSERVICE=false
RECOMMENDATION_SERVICE_URL=http://localhost:4000
```

### 3. Important Notes:

1. **NEXTAUTH_URL**: Replace `https://your-app-name.vercel.app` with your actual Vercel deployment URL
2. **NEXT_PUBLIC_BASE_URL**: Same as above
3. For each environment variable, select **All** environments (Production, Preview, Development)
4. After adding all variables, trigger a **Redeploy** from the Deployments tab

### 4. Redeploy
- Go to **Deployments** tab
- Click the three dots on the latest deployment
- Select **Redeploy**

### 5. Common Issues:

- **404 errors**: Usually means environment variables are missing or MongoDB connection failed
- **Build failures**: Check the build logs in Vercel for specific errors
- **TypeScript errors**: The config has `ignoreBuildErrors: true`, but you should fix them eventually

### 6. MongoDB Atlas IP Whitelist
Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel's IP addresses.

### 7. Test Your Deployment
After redeploying, test these URLs:
- `https://your-app.vercel.app/` - Home page
- `https://your-app.vercel.app/shop` - Shop page  
- `https://your-app.vercel.app/api/products` - API endpoint

## Quick Fix Script

You can also use Vercel CLI to add env vars quickly:

```bash
npm i -g vercel
vercel login
vercel env pull .env.production
# Then edit .env.production and run:
vercel env add
```
