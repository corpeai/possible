# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

Create production `.env` file:

```env
# Production Solana Network
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta

# Agent Configuration (SECURE THESE!)
VITE_AGENT_WALLET_PRIVATE_KEY=your_production_private_key
VITE_OPENAI_API_KEY=your_production_openai_key

# x402 Payment Protocol - Production URLs
VITE_X402_DEFAULT_FACILITATOR=payai
VITE_X402_PAYAI_URL=https://facilitator.payai.network
VITE_X402_COINBASE_CDP_URL=https://facilitator.cdp.coinbase.com
VITE_X402_DEFAULT_NETWORK=solana:mainnet-beta
VITE_X402_TIMEOUT_MS=30000

# Jupiter Swap - Production
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6

# Application
VITE_APP_NAME=Solana AI Agent
VITE_APP_DESCRIPTION=AI-powered Solana agent with x402 payment support
```

### 2. Security Audit

**Critical Security Items:**

- [ ] Private keys stored securely (never in code/git)
- [ ] Environment variables properly configured
- [ ] API keys rotated and secured
- [ ] RPC endpoints use production-grade providers
- [ ] CORS policies configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all user inputs
- [ ] Transaction signing requires user confirmation
- [ ] Error messages don't leak sensitive info

### 3. Testing

**Pre-deployment tests:**

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Build test
pnpm build

# Preview production build
pnpm preview
```

**Manual Testing Checklist:**

- [ ] Wallet connection (Phantom, Solflare, etc.)
- [ ] Balance display accuracy
- [ ] SOL transfers work correctly
- [ ] x402 payment flow (create → verify → settle)
- [ ] Payment URL generation
- [ ] Error handling for failed transactions
- [ ] Network switching
- [ ] Mobile responsiveness
- [ ] Browser compatibility (Chrome, Firefox, Safari, Brave)

### 4. Performance Optimization

**Build Optimization:**

```bash
# Analyze bundle size
pnpm build --analyze

# Check for unused dependencies
npx depcheck

# Optimize images and assets
# Ensure all images are compressed
```

**Performance Targets:**

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s
- Bundle size: < 500KB (gzipped)

### 5. RPC Provider Setup

**Recommended Production RPC Providers:**

1. **Helius** (Recommended)
   - URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Features: High reliability, rate limits, analytics
   - Pricing: Free tier available

2. **QuickNode**
   - URL: `https://YOUR_ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/`
   - Features: Global infrastructure, 99.9% uptime
   - Pricing: Starts at $9/month

3. **Alchemy**
   - URL: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`
   - Features: Enhanced APIs, monitoring
   - Pricing: Free tier available

4. **Triton (RPC Pool)**
   - URL: `https://YOUR_ENDPOINT.rpcpool.com/YOUR_TOKEN`
   - Features: Load balancing, fallback
   - Pricing: Custom pricing

**RPC Configuration:**

```typescript
// src/config/rpc.ts
export const RPC_CONFIG = {
  primary: import.meta.env.VITE_SOLANA_RPC_URL,
  fallbacks: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
  ],
  commitment: 'confirmed',
  timeout: 30000,
};
```

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Setup:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**vercel.json:**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SOLANA_RPC_URL": "@solana-rpc-url",
    "VITE_SOLANA_NETWORK": "mainnet-beta",
    "VITE_X402_PAYAI_URL": "https://facilitator.payai.network"
  },
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
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**Setup:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**netlify.toml:**

```toml
[build]
  command = "pnpm build"
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
```

### Option 3: AWS S3 + CloudFront

**Build and deploy:**

```bash
# Build
pnpm build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 4: Self-Hosted (Docker)

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Deploy:**

```bash
# Build image
docker build -t solana-ai-agent .

# Run container
docker run -d -p 80:80 --name solana-agent solana-ai-agent
```

## Post-Deployment

### 1. Monitoring Setup

**Error Tracking (Sentry):**

```bash
pnpm add @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

**Analytics (Plausible/Google Analytics):**

```html
<!-- index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### 2. Performance Monitoring

**Web Vitals:**

```typescript
// src/utils/vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  console.log(metric);
  // Send to your analytics service
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### 3. Health Checks

**Create health check endpoint:**

```typescript
// src/utils/health.ts
export async function checkHealth() {
  const checks = {
    rpc: await checkRPC(),
    facilitator: await checkFacilitator(),
    timestamp: Date.now(),
  };
  return checks;
}

async function checkRPC() {
  try {
    const response = await fetch(import.meta.env.VITE_SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth',
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkFacilitator() {
  try {
    const response = await fetch(`${import.meta.env.VITE_X402_PAYAI_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

### 4. Backup and Recovery

**Backup Strategy:**

1. **Code**: Git repository (GitHub/GitLab)
2. **Environment Variables**: Secure vault (1Password, AWS Secrets Manager)
3. **Build Artifacts**: S3 or similar storage
4. **Database** (if applicable): Automated backups

**Recovery Plan:**

```bash
# Quick rollback to previous version
vercel rollback

# Or redeploy from git tag
git checkout v1.0.0
vercel --prod
```

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review security alerts
- [ ] Test critical user flows

**Monthly:**
- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Backup verification

**Quarterly:**
- [ ] Full security audit
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Documentation update

### Dependency Updates

```bash
# Check for updates
pnpm outdated

# Update dependencies
pnpm update

# Update to latest (careful!)
pnpm update --latest

# Test after updates
pnpm build && pnpm preview
```

### Security Updates

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Force fix (may break things)
pnpm audit fix --force
```

## Troubleshooting

### Common Production Issues

**1. RPC Rate Limiting**
- Solution: Implement request caching, use premium RPC provider
- Fallback: Configure multiple RPC endpoints

**2. Transaction Failures**
- Check: Network congestion, insufficient balance, RPC issues
- Solution: Implement retry logic with exponential backoff

**3. Wallet Connection Issues**
- Check: Browser extensions, network compatibility
- Solution: Clear cache, update wallet extension

**4. Payment Verification Failures**
- Check: Facilitator availability, network connectivity
- Solution: Implement fallback facilitators, better error handling

**5. High Bundle Size**
- Solution: Code splitting, lazy loading, tree shaking
- Tools: `vite-bundle-visualizer`

### Debug Mode

Enable production debugging:

```typescript
// Add to localStorage in browser console
localStorage.setItem('debug', 'x402:*,solana:*');
```

## Support Contacts

- **Technical Issues**: [Your support email]
- **Security Issues**: [Your security email]
- **RPC Provider Support**: [Provider support links]
- **x402 Protocol**: https://docs.x402.org

## Compliance

### Legal Requirements

- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy (if applicable)
- [ ] GDPR compliance (EU users)
- [ ] AML/KYC considerations (if applicable)

### Regulatory Considerations

- Consult legal counsel for crypto payment regulations
- Ensure compliance with local financial regulations
- Implement necessary user disclosures
- Consider geo-blocking if required

---

**Last Updated**: 2025-01-14
**Version**: 1.0.0
