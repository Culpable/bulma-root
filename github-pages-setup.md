# GitHub Pages Setup for bulma.com.au

End-to-end guide to deploy this Next.js static site to GitHub Pages.

## Prerequisites

- Node.js 18+ installed locally
- GitHub account
- Git installed locally

## 1. Create GitHub Repository

### Option A: Via GitHub Web UI

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `bulma-root`
3. Description: "Bulma marketing website"
4. Visibility: **Public** (required for GitHub Pages on free tier)
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### Option B: Via GitHub CLI

```bash
# Install gh CLI if needed: brew install gh
gh auth login
gh repo create bulma-root --public --description "Bulma marketing website"
```

## 2. Configure Next.js for Static Export

Edit `demo/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '', // Leave empty for custom domain, or use '/repo-name' for github.io
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Recommended for GitHub Pages
}

export default nextConfig
```

## 3. Update package.json Scripts

In `demo/package.json`, ensure these scripts exist:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

## 4. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in the repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: demo/package-lock.json

      - name: Install dependencies
        working-directory: demo
        run: npm ci

      - name: Build
        working-directory: demo
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: demo/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## 5. Configure Custom Domain (bulma.com.au)

### 5.1 Create CNAME File

Create `demo/public/CNAME`:

```
bulma.com.au
```

### 5.2 Configure DNS

Add these records in your DNS provider:

**Option A: Apex domain (bulma.com.au)**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**Option B: www subdomain (www.bulma.com.au)**
```
Type: CNAME
Name: www
Value: <username>.github.io
```

### 5.3 Enable GitHub Pages

1. Go to repository **Settings** > **Pages**
2. Under **Source**, select **GitHub Actions**
3. Under **Custom domain**, enter `bulma.com.au`
4. Check **Enforce HTTPS** (after DNS propagates)

## 6. Initialize Git and Push

```bash
cd bulma-root

# Initialize git repository
git init
git branch -M main

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
demo/node_modules/

# Next.js
demo/.next/
demo/out/

# IDE
.idea/

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local
EOF

# Stage all files
git add .

# Initial commit
git commit -m "Initial commit: Oatmeal template for Bulma"

# Connect to GitHub (replace <username> with your GitHub username)
git remote add origin git@github.com:<username>/bulma-root.git

# Push to GitHub
git push -u origin main
```

## 7. Verify Deployment

After pushing:

1. Go to **Actions** tab in GitHub to monitor the workflow
2. Once complete, visit `bulma.com.au` (after DNS propagation, 5min - 48hrs)
3. Check **Settings** > **Pages** for deployment status

## 8. Local Development

```bash
cd demo
npm install
npm run dev
# Visit http://localhost:3000
```

## 9. Build Locally (Test Static Export)

```bash
cd demo
npm run build
# Output in demo/out/
```

## Troubleshooting

### Build fails with image optimization error
Ensure `images.unoptimized: true` is set in `next.config.ts`

### 404 on subpages
Ensure `trailingSlash: true` is set in `next.config.ts`

### Custom domain not working
- Wait for DNS propagation (up to 48 hours)
- Verify CNAME file exists in `demo/public/CNAME`
- Check A records point to GitHub's IPs

### Assets not loading
- Verify `basePath` is correct (empty for custom domain)
- Check browser console for 404 errors

## File Structure After Setup

```
bulma-root/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vscode/
│   └── launch.json      # VS Code debug configurations
├── demo/
│   ├── public/
│   │   ├── CNAME
│   │   └── img/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   ├── next.config.ts
│   └── package.json
├── components/          # Template components (reference)
├── pages/               # Template page variants (reference)
├── .gitignore
├── github-pages-setup.md
├── files-to-change.md
└── README.md
```
