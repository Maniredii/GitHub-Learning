# Frontend Deployment Guide

This guide covers deploying the GitQuest React frontend to various platforms.

## Prerequisites

- Backend API deployed and accessible
- Domain name configured
- Environment variables prepared

## Build Production Bundle

```bash
# From project root
cd frontend

# Install dependencies
npm install

# Set production environment variables
export VITE_API_URL=https://api.gitquest.yourdomain.com
export VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Build
npm run build

# Test build locally
npm run preview
```

The build output will be in `frontend/dist/`.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides automatic deployments, CDN, and SSL.

#### Setup via Web UI

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables:
   ```
   VITE_API_URL=https://api.gitquest.yourdomain.com
   VITE_ENV=production
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```

6. Deploy

7. Add custom domain:
   - Go to Project Settings → Domains
   - Add `gitquest.yourdomain.com`
   - Update DNS records as instructed
   - SSL is automatic

#### Setup via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables
vercel env add VITE_API_URL production
vercel env add VITE_STRIPE_PUBLIC_KEY production

# Deploy to production
vercel --prod

# Add custom domain
vercel domains add gitquest.yourdomain.com
```

#### Vercel Configuration File

Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

Netlify provides similar features to Vercel.

#### Setup via Web UI

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect Git repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add environment variables in Site Settings → Environment Variables:
   ```
   VITE_API_URL=https://api.gitquest.yourdomain.com
   VITE_ENV=production
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```

6. Deploy

7. Add custom domain:
   - Go to Domain Settings
   - Add custom domain
   - Configure DNS
   - SSL is automatic

#### Setup via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
cd frontend
netlify init

# Deploy
netlify deploy --prod

# Set environment variables
netlify env:set VITE_API_URL "https://api.gitquest.yourdomain.com"
netlify env:set VITE_STRIPE_PUBLIC_KEY "pk_live_..."
```

#### Netlify Configuration File

Create `frontend/netlify.toml`:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### Option 3: AWS CloudFront + S3

For more control and potentially lower costs at scale.

#### Setup

```bash
# Create S3 bucket
aws s3 mb s3://gitquest-frontend --region us-east-1

# Configure bucket for static website hosting
aws s3 website s3://gitquest-frontend \
  --index-document index.html \
  --error-document index.html

# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://gitquest-frontend --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name gitquest-frontend.s3.amazonaws.com \
  --default-root-object index.html

# Get distribution ID
aws cloudfront list-distributions

# Configure custom domain (requires ACM certificate)
# See AWS documentation for detailed steps
```

#### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gitquest-frontend/*"
    }
  ]
}
```

#### CloudFront Configuration

- **Origin**: S3 bucket
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS
- **Compress Objects Automatically**: Yes
- **Price Class**: Use Only U.S., Canada and Europe (or All Edge Locations)
- **Alternate Domain Names**: gitquest.yourdomain.com
- **SSL Certificate**: Custom SSL Certificate (from ACM)
- **Default Root Object**: index.html
- **Custom Error Responses**: 
  - 403 → /index.html (200)
  - 404 → /index.html (200)

### Option 4: DigitalOcean App Platform

#### Setup via Web UI

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Select `frontend` directory
5. Configure:
   - **Type**: Static Site
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add environment variables:
   ```
   VITE_API_URL=https://api.gitquest.yourdomain.com
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```

7. Deploy

8. Add custom domain in Settings

## Custom Domain Configuration

### DNS Records

Add these records to your DNS provider:

**For Vercel/Netlify:**
```
Type: CNAME
Name: gitquest (or @)
Value: <platform-provided-value>
```

**For CloudFront:**
```
Type: A (Alias)
Name: gitquest (or @)
Value: <cloudfront-distribution-domain>
```

### SSL Certificate

All recommended platforms provide automatic SSL:
- **Vercel**: Automatic via Let's Encrypt
- **Netlify**: Automatic via Let's Encrypt
- **CloudFront**: Use AWS Certificate Manager
- **DigitalOcean**: Automatic via Let's Encrypt

## Environment Variables

Set these in your deployment platform:

```bash
# Required
VITE_API_URL=https://api.gitquest.yourdomain.com
VITE_ENV=production

# Optional
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_ANALYTICS_ID=<analytics-id>
```

## Build Optimization

### Vite Configuration

Already optimized in `frontend/vite.config.ts`:
- Code splitting
- Asset optimization
- Compression
- Tree shaking

### Additional Optimizations

1. **Enable Gzip/Brotli compression** (automatic on most platforms)
2. **Configure CDN caching**:
   - HTML: No cache or short cache
   - JS/CSS: Long cache (1 year) with content hashing
   - Images: Long cache
3. **Enable HTTP/2** (automatic on most platforms)
4. **Preload critical resources**
5. **Lazy load routes and components**

## Deployment Workflow

### Automatic Deployments

Configure automatic deployments on Git push:

**Vercel:**
- Automatic on push to main branch
- Preview deployments for pull requests

**Netlify:**
- Automatic on push to main branch
- Deploy previews for pull requests

**GitHub Actions (for S3/CloudFront):**

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
        working-directory: frontend
      
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLIC_KEY: ${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
        run: npm run build
        working-directory: frontend
      
      - name: Deploy to S3
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws s3 sync dist/ s3://gitquest-frontend --delete
        working-directory: frontend
      
      - name: Invalidate CloudFront
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## Testing Deployment

### Smoke Tests

```bash
# Test homepage loads
curl -I https://gitquest.yourdomain.com

# Test API connectivity
curl https://gitquest.yourdomain.com/api

# Test routing (should return index.html)
curl -I https://gitquest.yourdomain.com/quests

# Test SSL
curl -vI https://gitquest.yourdomain.com 2>&1 | grep -i ssl
```

### Browser Tests

1. Open https://gitquest.yourdomain.com
2. Check console for errors
3. Test authentication flow
4. Test quest loading
5. Test terminal functionality
6. Test on mobile devices
7. Test in different browsers

### Performance Tests

```bash
# Lighthouse audit
npm install -g lighthouse
lighthouse https://gitquest.yourdomain.com --view

# WebPageTest
# Visit https://www.webpagetest.org/
```

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Netlify

```bash
# List deploys
netlify deploy:list

# Restore previous deploy
netlify deploy:restore <deploy-id>
```

### CloudFront + S3

```bash
# S3 versioning should be enabled
# Restore previous version
aws s3 sync s3://gitquest-frontend-backup/ s3://gitquest-frontend/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

## Monitoring

### Performance Monitoring

- **Vercel Analytics**: Built-in (free tier available)
- **Netlify Analytics**: Built-in (paid)
- **Google Analytics**: Add to `index.html`
- **Sentry**: For error tracking

### Uptime Monitoring

- **UptimeRobot**: Free tier available
- **Pingdom**: Paid
- **StatusCake**: Free tier available

## Security Headers

Ensure these headers are set (configured in platform config files above):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## Troubleshooting

### Build Fails

1. Check Node.js version matches local development
2. Verify all environment variables are set
3. Check build logs for specific errors
4. Test build locally

### Routing Issues (404 on refresh)

1. Ensure SPA fallback is configured
2. Check redirect rules
3. Verify `index.html` is served for all routes

### API Connection Fails

1. Check CORS configuration on backend
2. Verify API URL is correct
3. Check SSL certificate on API
4. Test API endpoint directly

### Slow Load Times

1. Check bundle size
2. Enable compression
3. Optimize images
4. Use CDN
5. Enable caching

## Cost Estimates

### Vercel
- **Hobby**: Free (100GB bandwidth/month)
- **Pro**: $20/month (1TB bandwidth)

### Netlify
- **Starter**: Free (100GB bandwidth/month)
- **Pro**: $19/month (1TB bandwidth)

### AWS CloudFront + S3
- **S3**: ~$0.023/GB storage + $0.09/GB transfer
- **CloudFront**: ~$0.085/GB (first 10TB)
- **Estimate**: $5-20/month for moderate traffic

### DigitalOcean
- **Static Site**: Free (1GB bandwidth)
- **Starter**: $5/month (250GB bandwidth)

## Next Steps

After frontend deployment:
1. Test all functionality
2. Run performance audits
3. Set up monitoring
4. Configure analytics
5. Test on multiple devices/browsers
6. Update documentation with live URLs
