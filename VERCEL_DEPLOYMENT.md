# Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `DATABASE_URL` - Your Neon database connection string
  - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

**Optional (with defaults):**
- `ADMIN_USERNAME` - Default: `admin`
- `ADMIN_PASSWORD` - Default: `admin@fcit2025`
- `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### 2. Database Setup
1. Ensure your Neon database is running (not paused)
2. Run the initialization script in Neon SQL Editor:
   - Copy contents from `scripts/init-db.sql`
   - Paste and execute in Neon dashboard

### 3. Build Configuration
- ✅ Next.js 14 is configured correctly
- ✅ TypeScript is set up
- ✅ All dependencies are in `package.json`

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables
In Vercel project settings:
1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - `DATABASE_URL` = `your-neon-connection-string`
   - `ADMIN_USERNAME` = `your-admin-username` (optional)
   - `ADMIN_PASSWORD` = `your-secure-password` (optional)
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app` (optional)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-app.vercel.app`

## ⚠️ Important Notes

### Security
- ✅ Cookies are automatically secure in production
- ✅ Admin authentication is session-based
- ⚠️ **Change default admin credentials in production!**
- ⚠️ File uploads are stored as base64 in database (consider cloud storage for production)

### File Uploads
Currently, payment screenshots are stored as base64 strings in the database. This works but has limitations:
- Maximum file size: ~1MB (database limit)
- Not ideal for large images
- Consider migrating to cloud storage (S3, Cloudinary) for production

### Database
- Ensure Neon database is not paused
- Connection string must include `?sslmode=require`
- Database must be accessible from Vercel's servers

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check if database is paused in Neon dashboard
- Ensure SSL mode is included in connection string

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Verify they're set for the correct environment (Production/Preview)

### QR Code Not Working
- Ensure `NEXT_PUBLIC_APP_URL` is set to your Vercel URL
- QR codes use absolute URLs, so they need the correct domain

## 📝 Post-Deployment

1. **Test Registration Flow**
   - Register a new user
   - Test both cash and online payment
   - Verify QR code scanning

2. **Test Admin Dashboard**
   - Login with admin credentials
   - Approve/reject registrations
   - Export CSV

3. **Update Admin Credentials**
   - Change default admin password
   - Use strong, unique password

4. **Monitor**
   - Check Vercel logs for errors
   - Monitor database usage in Neon dashboard

## 🎉 You're Ready!

Your application is now live on Vercel! Make sure to:
- Test all features
- Change admin credentials
- Monitor for any issues
- Consider upgrading file storage for production use

