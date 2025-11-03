# 🎯 SCCF News Platform - Complete Setup Guide

## 📍 What Just Happened?

Your news platform has been **restructured into a clean, integrated solution**!

### Before (Messy):
```
E:\Projects\Websits\
├── sccf/                    # Main website
├── sccf-news/               # ❌ Separate folder
└── sccf-sanity-studio/      # ❌ Another separate folder
```

### After (Clean & Secure):
```
E:\Projects\Websits\
└── sccf/                    # Main repository
    ├── index.html           # Main website
    ├── assets/
    ├── server/
    └── news-platform/       # ✅ Integrated news system
        ├── app/
        │   └── studio/      # CMS at /studio route
        ├── components/
        ├── sanity/
        └── package.json
```

---

## ✅ Benefits

1. **Single Repository** - Everything in one GitHub repo
2. **Integrated CMS** - Sanity Studio at `/studio` route (no separate deployment)
3. **Cleaner Structure** - Professional organization
4. **Easier Deployment** - Deploy news platform independently or with main site
5. **Better Version Control** - Unified git history
6. **Simpler Maintenance** - One place for everything

---

## 🚀 Quick Start (3 Steps)

### Step 1: Clean Up Temporary Folders (Optional)

```powershell
cd E:\Projects\Websits\sccf
.\cleanup-temp-folders.ps1
```

This removes the old `sccf-news` and `sccf-sanity-studio` folders.

### Step 2: Install Dependencies

```powershell
cd E:\Projects\Websits\sccf\news-platform
npm install
```

### Step 3: Configure & Run

1. **Set up Sanity:**
```powershell
npm install -g @sanity/cli
sanity login
sanity init
```

2. **Update `.env.local`** with your Sanity Project ID

3. **Start development:**
```powershell
npm run dev
```

**Access:**
- Website: http://localhost:3001
- CMS: http://localhost:3001/studio

---

## 📂 Where Everything Is

| Item | Location |
|------|----------|
| **Main SCCF Website** | `E:\Projects\Websits\sccf\` |
| **News Platform** | `E:\Projects\Websits\sccf\news-platform\` |
| **News Components** | `news-platform\components\` |
| **Sanity Schemas** | `news-platform\sanity\schemas\` |
| **News Config** | `news-platform\package.json` |
| **Sanity Studio** | Accessible at `/studio` route |

---

## 🌐 Deployment Strategy

### Option 1: Deploy News Separately (Recommended)

**Main Site:**
- Deploy `sccf/` root to: `sccf.lk`

**News Platform:**
- Deploy `sccf/news-platform/` to: `news.sccf.lk`

In Vercel:
1. Create 2 projects from same repository
2. Project 1: Root directory = `/` → `sccf.lk`
3. Project 2: Root directory = `news-platform` → `news.sccf.lk`

### Option 2: Monorepo with Vercel

Use Vercel's monorepo support:
```json
// vercel.json in root
{
  "builds": [
    { "src": "news-platform/package.json", "use": "@vercel/next" }
  ]
}
```

---

## 🔒 Security Advantages

✅ **Centralized Secrets**: All environment variables in one place  
✅ **Single Repository Access**: Easier to manage permissions  
✅ **Unified Security Policies**: Apply once across all projects  
✅ **Better Audit Trail**: All changes in one git history  

---

## 🎯 Git Workflow

```powershell
# Navigate to main repo
cd E:\Projects\Websits\sccf

# Check status
git status

# Add news platform
git add news-platform/

# Commit
git commit -m "Add integrated news platform"

# Push to GitHub
git push origin main
```

---

## 📝 Creating Your First Article

1. Go to http://localhost:3001/studio
2. Create an Author
3. Create an Article
4. Publish
5. View at http://localhost:3001

---

## 🔗 Linking Main Site to News

In your main SCCF website (`index.html`), add:

```html
<a href="https://news.sccf.lk" class="news-link">
  Latest News & Updates
</a>
```

Or if using same domain:
```html
<a href="/news">Latest News</a>
```

---

## 🆚 Comparison

| Aspect | Old Setup | New Setup |
|--------|-----------|-----------|
| Folders | 3 separate | 1 organized |
| Repositories | 2-3 repos | 1 repo |
| CMS Hosting | Separate | Integrated at `/studio` |
| Deployment | 2-3 deployments | 1-2 deployments |
| Maintenance | Complex | Simple |
| Version Control | Multiple histories | Unified history |

---

## 🐛 Troubleshooting

### Old folders still there?
Run: `.\cleanup-temp-folders.ps1`

### Dependencies not installing?
```powershell
cd news-platform
rm -rf node_modules
rm package-lock.json
npm install
```

### Sanity Studio not working?
1. Check `.env.local` has correct Project ID
2. Run: `sanity login`
3. Verify at https://sanity.io/manage

---

## 📚 Documentation

- **News Platform**: [news-platform/README.md](news-platform/README.md)
- **Main Repo**: [README.md](README.md)
- **Sanity Docs**: https://www.sanity.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✨ What's Included

✅ Next.js 14 with App Router  
✅ TypeScript configuration  
✅ Tailwind CSS with SCCF branding  
✅ Sanity CMS integrated  
✅ All pages (Home, About, Articles, Contact)  
✅ All components (Navbar, Footer, Cards)  
✅ Responsive design  
✅ SEO optimization  
✅ Production-ready  

---

## 🎉 You're All Set!

Your news platform is now:
- ✅ Properly organized
- ✅ Easy to maintain
- ✅ Secure and professional
- ✅ Ready to deploy
- ✅ GitHub-friendly

---

## 📞 Need Help?

1. Check `news-platform/README.md`
2. Review this guide
3. Check Next.js/Sanity documentation
4. Contact your development team

---

**🚀 Next Steps:**

1. Run cleanup script (optional)
2. Install dependencies
3. Configure Sanity
4. Create sample content
5. Deploy to production

---

<p align="center">
  <strong>One repository. One deployment. Infinite possibilities.</strong>
</p>

<p align="center">
  Built with ❤️ for SCCF Community
</p>
