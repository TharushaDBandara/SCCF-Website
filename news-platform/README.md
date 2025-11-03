# 🚀 SCCF News Platform - Integrated Solution

## 📍 Location
This news platform is located at: `E:\Projects\Websits\sccf\news-platform\`

**Part of the main SCCF-Website repository** - One repository, clean structure!

---

## ✨ What's Special About This Setup

### **Integrated Architecture**
- ✅ **Single Repository**: Everything in one place
- ✅ **Embedded CMS**: Sanity Studio runs at `/studio` route
- ✅ **No Separate Folders**: Clean, unified structure
- ✅ **Easy Deployment**: Deploy as one unit
- ✅ **Shared Git History**: Version control simplified

---

## 🏗️ Project Structure

```
sccf/                              # Main SCCF repository
├── news-platform/                 # News website (THIS FOLDER)
│   ├── app/
│   │   ├── studio/[[...index]]/   # ⚙️ Sanity Studio at /studio
│   │   ├── about/                 # About page
│   │   ├── article/[slug]/        # Dynamic article pages
│   │   ├── articles/              # All articles
│   │   ├── contact/               # Contact page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Homepage
│   │
│   ├── components/
│   │   ├── ArticleCard.tsx
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   │
│   ├── sanity/                    # Sanity CMS schemas
│   │   └── schemas/
│   │       ├── article.ts
│   │       ├── author.ts
│   │       └── index.ts
│   │
│   ├── lib/
│   │   └── sanity.ts              # Sanity client
│   │
│   ├── package.json
│   ├── sanity.config.ts           # Sanity configuration
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local
│
├── assets/                        # Existing SCCF website
├── server/                        # Existing backend
├── index.html                     # Main SCCF site
└── README.md                      # Main repo README
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```powershell
cd E:\Projects\Websits\sccf\news-platform
npm install
```

### Step 2: Set Up Sanity

```powershell
# Install Sanity CLI (if not already installed)
npm install -g @sanity/cli

# Login to Sanity
sanity login

# Create new Sanity project
sanity init --project-plan free
```

Copy the **Project ID** shown after creation!

### Step 3: Configure Environment

Edit `.env.local` and add your Sanity Project ID:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### Step 4: Start Development Server

```powershell
npm run dev
```

**Access Points:**
- 🌐 **Website**: http://localhost:3001
- ⚙️ **Sanity Studio**: http://localhost:3001/studio

---

## 📝 Creating Content

1. Open http://localhost:3001/studio
2. Create an **Author** first
3. Create an **Article**:
   - Title
   - Slug (auto-generated)
   - Author
   - Main Image
   - Excerpt (max 200 chars)
   - Body (rich text)
   - Published date
   - Category
4. Click **Publish**
5. View at http://localhost:3001

---

## 🎨 SCCF Brand Colors

```css
Primary:     #00796B  /* Teal */
Dark Green:  #004D40
Light Aqua:  #E0F2F1
Dark Gray:   #212121
```

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub:**
```powershell
cd E:\Projects\Websits\sccf
git add news-platform/
git commit -m "Add integrated news platform"
git push origin main
```

2. **Deploy on Vercel:**
- Go to https://vercel.com
- Import your repository
- **Root Directory**: `news-platform`
- Add environment variables:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION`
- Deploy

3. **Configure Custom Domain:**
- In Vercel project settings → Domains
- Add: `news.sccf.lk`
- Update DNS with CNAME record

### Option 2: Deploy Both Sites Separately

**Main SCCF Site:**
- Deploy from root of repository
- Domain: `sccf.lk`

**News Platform:**
- Deploy from `news-platform/` directory
- Domain: `news.sccf.lk`

---

## 🔧 Available Commands

```powershell
npm run dev      # Start development server (port 3001)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check for errors
```

---

## 📦 Key Features

- ✅ **Next.js 14**: Latest framework with App Router
- ✅ **Integrated CMS**: Sanity Studio at `/studio` route
- ✅ **TypeScript**: Full type safety
- ✅ **Tailwind CSS**: SCCF-branded styling
- ✅ **Responsive**: Mobile-first design
- ✅ **SEO Optimized**: Meta tags and sitemap ready
- ✅ **Image Optimization**: Automatic via Next/Image
- ✅ **Single Repository**: Easy to manage

---

## 🔒 Security Features

- ✅ Environment variables for secrets
- ✅ Sanity CORS configuration
- ✅ HTTPS/SSL ready
- ✅ Input validation
- ✅ XSS protection

---

## 🔗 Integration with Main SCCF Site

Add a link in your main SCCF website to the news platform:

**In `index.html` or navigation:**
```html
<a href="https://news.sccf.lk">Latest News</a>
```

**Or if deployed to subdirectory:**
```html
<a href="/news">Latest News</a>
```

---

## 📱 Pages

- **/** - Homepage with latest articles
- **/about** - About SCCF
- **/articles** - All articles listing
- **/article/[slug]** - Individual article pages
- **/contact** - Contact form
- **/studio** - Sanity CMS (admin only)

---

## 🆚 Advantages of This Setup

### vs. Two Separate Folders
✅ Single git repository  
✅ Unified version control  
✅ Easier deployment  
✅ No synchronization issues  

### vs. Separate Repositories
✅ Shared history  
✅ Easier to manage  
✅ Single deployment pipeline  
✅ Less overhead  

### vs. Manual CMS
✅ No separate CMS hosting  
✅ Integrated authentication  
✅ Same deployment  
✅ Easier to maintain  

---

## 🔄 Updating the Platform

```powershell
# Navigate to news platform
cd E:\Projects\Websits\sccf\news-platform

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Rebuild
npm run build
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'next'"
```powershell
cd E:\Projects\Websits\sccf\news-platform
npm install
```

### Issue: Sanity Studio not loading
1. Check Project ID in `.env.local`
2. Verify you're logged in: `sanity login`
3. Check Sanity dashboard: https://sanity.io/manage

### Issue: Images not displaying
- Ensure `cdn.sanity.io` is in `next.config.js` domains
- Check image URLs in Sanity

### Issue: Port 3001 already in use
```powershell
# Change port in package.json scripts or:
npm run dev -- -p 3002
```

---

## 📚 Documentation

- **Next.js**: https://nextjs.org/docs
- **Sanity**: https://www.sanity.io/docs
- **Tailwind**: https://tailwindcss.com/docs
- **Vercel**: https://vercel.com/docs

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure Sanity project
3. ✅ Set environment variables
4. ✅ Create sample content
5. ✅ Customize branding (if needed)
6. ✅ Test all features
7. ✅ Deploy to production
8. ✅ Configure custom domain

---

## 💡 Pro Tips

- Access Studio at `/studio` route (no separate server needed!)
- Use `npm run dev` to run both website AND Studio
- All content is managed in one place
- Deploy the entire `news-platform/` folder as one unit
- Keep your Sanity Project ID secret in `.env.local`

---

## 🎉 Benefits of Integrated Setup

**Before (2 folders):**
```
sccf-news/          → Deploy separately
sccf-sanity-studio/ → Deploy separately
```

**After (1 folder):**
```
news-platform/      → Deploy once, everything works!
  ├── Website at: /
  └── Studio at: /studio
```

**Result:**
- ✅ Cleaner repository
- ✅ Easier deployment
- ✅ Better organization
- ✅ Simpler maintenance

---

## 📞 Support

For issues or questions:
- Check this README
- Review Sanity docs
- Check Next.js documentation
- Contact your development team

---

**Built with ❤️ for SCCF**

*One folder, one deployment, infinite possibilities!* 🚀
