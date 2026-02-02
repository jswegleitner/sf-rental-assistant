# SF Rental Assistant - Deployment Guide

## Quick Setup (Free Hosting)

### 1. Create GitHub Repository

```bash
cd "C:\Users\jsweg\OneDrive\Documents\Side Projects\SF Rental Assistant"
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Go to GitHub.com and create a new repository called `sf-rental-assistant`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/sf-rental-assistant.git
git push -u origin main
```

### 2. Deploy Backend to Azure (FREE)

1. Install Azure CLI: https://aka.ms/installazurecliwindows
2. Login and create resources:

```bash
az login
az group create --name sf-rental-rg --location westus2
az appservice plan create --name sf-rental-plan --resource-group sf-rental-rg --sku F1 --is-linux
az webapp create --resource-group sf-rental-rg --plan sf-rental-plan --name YOUR-UNIQUE-APP-NAME --runtime "PYTHON:3.11"
```

3. Configure startup:

```bash
az webapp config set --resource-group sf-rental-rg --name YOUR-UNIQUE-APP-NAME --startup-file "startup.txt"
```

4. Deploy:

```bash
az webapp up --resource-group sf-rental-rg --name YOUR-UNIQUE-APP-NAME --runtime "PYTHON:3.11"
```

5. Your backend URL: `https://YOUR-UNIQUE-APP-NAME.azurewebsites.net`

### 3. Deploy Frontend to GitHub Pages (FREE)

1. Enable GitHub Pages:
   - Go to your repo → Settings → Pages
   - Source: GitHub Actions

2. Add secret for backend URL:
   - Settings → Secrets → Actions
   - New secret: `BACKEND_URL` = `https://YOUR-UNIQUE-APP-NAME.azurewebsites.net`

3. Push to trigger deployment:

```bash
git push
```

Your app will be live at: `https://YOUR_USERNAME.github.io/sf-rental-assistant/`

### 4. Update CORS in Flask

Add your GitHub Pages URL to CORS in app.py (line ~438):

```python
CORS(app, origins=["https://YOUR_USERNAME.github.io"])
```

Push the change:

```bash
git add app.py
git commit -m "Add CORS for GitHub Pages"
git push
az webapp up --resource-group sf-rental-rg --name YOUR-UNIQUE-APP-NAME
```

## Cost: $0/month (within free tier limits)

- Azure App Service F1: Free tier (60 CPU minutes/day)
- GitHub Pages: Free for public repos
- Storage: File-based (included)

## Access from:
- Work computer: `https://YOUR_USERNAME.github.io/sf-rental-assistant/`
- Phone: Same URL
- Home: Same URL

Your saved searches persist in the backend file storage!
