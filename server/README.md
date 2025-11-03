Admin upload server (Flask)

Purpose
- Small local admin to upload project images and append project entries to assets/projects.json for the static site.
 - Supports basic ordering metadata: `featured` (boolean) and `priority` (number) which the site uses to sort projects.

Quick start (Windows PowerShell)

1. Create a virtual environment (recommended)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

2. Install dependencies
   pip install -r server\requirements.txt

3. Run the admin server
   python server\app.py

4. Open http://127.0.0.1:5000/admin in your browser. Upload a project.
   - Images are saved under server/uploads/projects/<your-id> and automatically mirrored to assets/uploads/projects/<your-id> so the static site can serve them.
   - Project entries are stored in server/data/projects.json. Use the "Republish" action on the Manage page to write published projects to assets/projects.json.

Notes
- This is intended for local development only. Do not expose this admin server to the public without authentication.
- The server writes directly to files in the repo; commit changes if you want them preserved.
- Ordering fields:
   - Featured: check to mark a project as featured.
   - Priority: integer (0-100). Higher values appear earlier. The site also supports a pinned order and category weights in `assets/config.js`.
- Static build behavior:
   - In development, the site loads image URLs like /uploads/... directly from the admin server.
   - For static/production, images are read from assets/uploads/... and only published projects are written to assets/projects.json. The Admin "Republish" action will mirror all files from server/uploads to assets/uploads as a safety net.
