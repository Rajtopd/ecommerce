# Supabase Auth Setup Checklist

## 1. Passwordless OTP Setup
- [ ] Enable **Email** provider in **Auth → Providers**
- [ ] Set OTP expiry to **600 seconds** (10 minutes) in **Auth → Settings**
- [ ] Update email subject: `"Your Soul Sisters login code"`
- [ ] Update email body: 
  ```
  Your login code is: {{ .Token }}
  This code expires in 10 minutes.
  ```

## 2. Google OAuth Setup
- [ ] Go to Google Cloud Console, create an OAuth client for Web Application.
- [ ] In Google Cloud Console:
  - Authorized JavaScript origins: `http://localhost:3000`, `https://yourproductiondomain.com`
  - Authorized redirect URIs: Enter the redirect URI from Supabase (found in Auth → Providers → Google settings, usually `https://<your-project>.supabase.co/auth/v1/callback`)
- [ ] In Supabase (Auth → Providers → Google):
  - [ ] Enable Google Provider
  - [ ] Paste **Client ID** from Google Console
  - [ ] Paste **Client Secret** from Google Console

## 3. URL Configuration
- [ ] Go to **Auth → URL Configuration**
- [ ] Set **Site URL** to: `https://yourproductiondomain.com` (or `http://localhost:3000` during dev testing)
- [ ] Under **Redirect URLs**, add:
  - `http://localhost:3000/*`
  - `https://yourproductiondomain.com/*`
