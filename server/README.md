Admin upload server (Flask)

Purpose
- Small local admin to upload project images and append project entries to assets/projects.json for the static site.

Quick start (Windows PowerShell)

1. Create a virtual environment (recommended)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

2. Install dependencies
   pip install -r server\requirements.txt

3. Run the admin server
   python server\app.py

4. Open http://127.0.0.1:5000/admin in your browser. Upload a project. Images are saved to assets/images/projects/ and projects appended to assets/projects.json.

Notes
- This is intended for local development only. Do not expose this admin server to the public without authentication.
- The server writes directly to files in the repo; commit changes if you want them preserved.
