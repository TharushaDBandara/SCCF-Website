# SCCF News Hub System

## ⚠️ Security Note
This codebase is safe to push to GitHub. All sensitive data has been removed:
- ✅ API URLs use environment detection (localhost vs production)
- ✅ No passwords, API keys, or secrets in code
- ✅ User-specific file paths are gitignored (`.vscode/`)
- ✅ Upload directories and runtime data are gitignored

## Setup Instructions

### 1. Install Dependencies
```bash
pip install flask flask-cors
```

### 2. Start the News Server
```bash
python server/news_app.py
```
Server will run on `http://localhost:5001`

### 3. Access the Application
- **Public News Page**: Open `news.html` in browser
- **Admin Panel**: http://localhost:5001

### 4. Configuration
The system automatically detects the environment:
- **Development**: Uses `http://localhost:5001`
- **Production**: Uses relative paths `/api/news`

## File Structure
```
├── assets/
│   ├── config.js         # API configuration (auto-detects environment)
│   ├── news.js           # Frontend news page logic
│   └── news.css          # News page styling
├── server/
│   ├── news_app.py       # Flask backend server
│   ├── templates/
│   │   └── news-admin.html  # Admin panel
│   ├── uploads/news/     # Uploaded images (gitignored)
│   └── data/news.json    # News data storage (gitignored)
└── news.html             # Public news page

```

## Features
- 📰 News article management with rich editor
- 🖼️ Multiple image upload (main + gallery images)
- 🏷️ Category filtering
- 📱 Fully responsive design
- 🔒 Secure file uploads
- 🌐 Multi-language support ready

## Deployment Notes
When deploying to production:
1. Update your web server to proxy `/api/news` to the Flask backend
2. Or update `assets/config.js` with your production API URL
3. Set up proper file permissions for upload directories
4. Consider using environment variables for sensitive config

## License
© 2025 Social Contribution Collective Foundation
