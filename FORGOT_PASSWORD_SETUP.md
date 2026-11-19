# Forgot Password Feature - Setup Guide

## Do You Need to Buy a Domain?

**Short Answer: No, you don't need to buy a domain.** 

The forgot password feature works perfectly fine with:
- **Development**: Localhost URLs (already working)
- **Production**: Free hosting platforms that provide domains/subdomains

---

## Current Status

### ✅ Development Mode (Working Now)
- Tokens are displayed on screen
- Works with `localhost` URLs
- No email needed
- Perfect for testing

### 🚀 Production Mode (What You'll Need)

---

## Option 1: Free Hosting (Recommended for Start)

Many platforms provide **free domains/subdomains**:

### Frontend Hosting Options:
1. **Vercel** (Recommended)
   - Free domain: `your-app.vercel.app`
   - Free SSL certificate
   - Easy deployment

2. **Netlify**
   - Free domain: `your-app.netlify.app`
   - Free SSL certificate
   - Easy deployment

3. **GitHub Pages**
   - Free domain: `username.github.io/your-app`
   - Free SSL certificate

### Backend Hosting Options:
1. **Railway** (Recommended)
   - Free tier available
   - Provides URL: `your-app.railway.app`
   - Easy database hosting

2. **Render**
   - Free tier available
   - Provides URL: `your-app.onrender.com`

3. **Heroku**
   - Has free tier alternatives
   - Provides URL: `your-app.herokuapp.com`

---

## Option 2: Use Your Own Domain (Optional)

Only buy a domain if:
- You want a professional name (e.g., `hostel-portal.com`)
- You need custom branding
- Free subdomains aren't suitable

**Cost**: ~$10-15/year (Namecheap, GoDaddy, etc.)

---

## What You Actually Need for Production

### 1. Email Sending Service (Required)

You need to send password reset emails. Here are free/cheap options:

#### Free Options:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free (first 3 months)
- **Resend**: 100 emails/day free

#### Setup Example (Using SendGrid):
```python
# Install: pip install sendgrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_password_reset_email(user_email, token):
    reset_url = f"https://your-app.vercel.app/reset-password?token={token}"
    
    message = Mail(
        from_email='noreply@yourdomain.com',
        to_emails=user_email,
        subject='Reset Your Password',
        html_content=f'''
        <p>Click the link below to reset your password:</p>
        <a href="{reset_url}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        '''
    )
    
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
```

---

## Quick Setup Steps for Production

### Step 1: Deploy Your App

**Frontend (Vercel example):**
```bash
cd frontend
npm run build
# Upload dist folder to Vercel
# Get URL: your-app.vercel.app
```

**Backend (Railway example):**
```bash
# Push to GitHub
# Connect to Railway
# Get URL: your-app.railway.app
```

### Step 2: Update Environment Variables

**Frontend (.env):**
```
VITE_API_URL=https://your-app.railway.app/api
```

**Backend (Railway environment variables):**
```
SENDGRID_API_KEY=your_sendgrid_key
FRONTEND_URL=https://your-app.vercel.app
```

### Step 3: Update Forgot Password Code

Replace the development code in `app.py`:

```python
# Remove this (lines 352-362):
return jsonify({
    "message": "Password reset link generated successfully.",
    "token": token,  # DEV ONLY
    "reset_url": reset_url,  # DEV ONLY
    "expires_at": expires_at.isoformat()
})

# With this:
reset_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={token}"
send_password_reset_email(user.email, token)  # Send email

return jsonify({
    "message": "If an account exists with that email, a password reset link has been sent."
})
```

---

## Development Workflow

### Testing Locally:
1. Use the current implementation (tokens shown on screen)
2. Copy the token from the response
3. Go to: `http://localhost:5173/reset-password?token=YOUR_TOKEN`
4. Reset password

### No Email Needed for Development!
The current setup is perfect for local testing.

---

## Cost Breakdown

### Free Option (Using Free Hosting):
- Frontend hosting: **FREE** (Vercel/Netlify)
- Backend hosting: **FREE** (Railway/Render)
- Email service: **FREE** (SendGrid - 100/day)
- Domain: **FREE** (Use provided subdomain)
- **Total: $0/month**

### Professional Option:
- Frontend hosting: **FREE**
- Backend hosting: **$5-7/month** (after free tier)
- Email service: **FREE** (or $10/month for more)
- Domain: **$10-15/year** (optional)
- **Total: ~$5-20/month**

---

## Summary

✅ **For Development**: No domain, no email needed - just works!
✅ **For Production (Free)**: Use free hosting + free email service
✅ **Buy Domain Only If**: You want custom branding ($10-15/year)

The forgot password feature will work perfectly with free hosting and free email services. No domain purchase required!

---

## Next Steps

1. **Right Now**: Keep using the development version (tokens on screen)
2. **When Ready to Deploy**: 
   - Deploy to free hosting (Vercel + Railway)
   - Sign up for free email service (SendGrid)
   - Update code to send emails instead of showing tokens
3. **Optional Later**: Buy domain if you want custom branding

Your current setup is perfect for development and can easily be upgraded for production! 🚀







