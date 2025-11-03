from flask import Flask, request, render_template, redirect, url_for, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'server', 'data')
UPLOAD_ROOT = os.path.join(BASE_DIR, 'server', 'uploads')
PROJECTS_JSON = os.path.join(DATA_DIR, 'projects.json')
PUBLIC_PROJECTS_JSON = os.path.join(BASE_DIR, 'assets', 'projects.json')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_ROOT, exist_ok=True)

app = Flask(__name__)
# Allow local static previews to call these APIs in dev (8000, 5500, 5501)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://127.0.0.1:8000",
            "http://localhost:8000",
            "http://127.0.0.1:5500",
            "http://localhost:5500",
            "http://127.0.0.1:5501",
            "http://localhost:5501"
        ]
    }
})
app.config['MAX_CONTENT_LENGTH'] = 25 * 1024 * 1024  # 25 MB

def _load_projects():
    if not os.path.exists(PROJECTS_JSON):
        return []
    try:
        with open(PROJECTS_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

def _save_projects(projects):
    """Persist full project list to local data store only."""
    with open(PROJECTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, indent=2)


def _write_public_projects(projects):
    """Write only published projects to the public JSON used by the static site."""
    try:
        assets_dir = os.path.join(BASE_DIR, 'assets')
        os.makedirs(assets_dir, exist_ok=True)
        published = [p for p in projects if p.get('published')]
        with open(PUBLIC_PROJECTS_JSON, 'w', encoding='utf-8') as pf:
            json.dump(published, pf, ensure_ascii=False, indent=2)
    except Exception:
        pass


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/admin')
def admin_index():
    """Render a simple upload form for adding projects."""
    return render_template('upload.html')


@app.route('/')
def index_redirect():
    """Redirect root to the admin UI to avoid confusion when visiting the base URL."""
    from flask import redirect
    return redirect('/admin')


@app.route('/api/projects', methods=['GET'])
def api_projects():
    return jsonify(_load_projects())


@app.route('/api/projects/<proj_id>', methods=['GET'])
def api_project_detail(proj_id):
    for p in _load_projects():
        if str(p.get('id')) == str(proj_id):
            return jsonify(p)
    return jsonify({'error': 'Not found'}), 404


@app.route('/admin/manage')
def admin_manage():
    """Simple management page to publish/unpublish projects."""
    projects = _load_projects()
    # sort newest first by id string for now
    projects = list(projects)
    projects.sort(key=lambda x: str(x.get('id', '')), reverse=True)
    return render_template('manage.html', projects=projects)


@app.route('/admin/publish/<proj_id>', methods=['POST'])
def admin_publish(proj_id):
    projects = _load_projects()
    updated = False
    for p in projects:
        if str(p.get('id')) == str(proj_id):
            p['published'] = True
            updated = True
            break
    if updated:
        _save_projects(projects)
        _write_public_projects(projects)
    return redirect(url_for('admin_manage'))


@app.route('/admin/unpublish/<proj_id>', methods=['POST'])
def admin_unpublish(proj_id):
    projects = _load_projects()
    updated = False
    for p in projects:
        if str(p.get('id')) == str(proj_id):
            p['published'] = False
            updated = True
            break
    if updated:
        _save_projects(projects)
        _write_public_projects(projects)
    return redirect(url_for('admin_manage'))


@app.route('/admin/republish', methods=['POST'])
def admin_republish():
    projects = _load_projects()
    _write_public_projects(projects)
    return redirect(url_for('admin_manage'))


@app.route('/admin/update/<proj_id>', methods=['POST'])
def admin_update(proj_id):
    """Update simple ordering metadata (featured, priority) for a project."""
    projects = _load_projects()
    updated = False
    for p in projects:
        if str(p.get('id')) == str(proj_id):
            # Featured checkbox
            p['featured'] = bool(request.form.get('featured'))
            # Priority as integer, default 0
            prw = (request.form.get('priority') or '').strip()
            try:
                p['priority'] = int(prw) if prw != '' else 0
            except Exception:
                p['priority'] = 0
            updated = True
            break

    if updated:
        _save_projects(projects)
        _write_public_projects(projects)
    # If request prefers JSON (AJAX), return a JSON result; otherwise redirect back
    wants_json = ('application/json' in (request.headers.get('Accept') or '')) or (request.args.get('ajax') == '1')
    if wants_json:
        return jsonify({'ok': updated})
    return redirect(url_for('admin_manage'))


@app.route('/api/gallery', methods=['GET'])
def api_gallery():
    items = []
    for p in _load_projects():
        if p.get('main_image'):
            items.append({
                'url': p['main_image'],
                'category': p.get('category', ''),
                'tags': p.get('tags', []),
                'projectId': p.get('id'),
            })
        for url in p.get('gallery_images', []) or []:
            items.append({
                'url': url,
                'category': p.get('category', ''),
                'tags': p.get('tags', []),
                'projectId': p.get('id'),
            })
    return jsonify(items)


@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_ROOT, filename)


@app.route('/admin/upload', methods=['POST'])
def upload_project():
    # Basic form parsing
    proj_id = (request.form.get('id') or request.form.get('proj_id') or request.form.get('project_id') or '').strip()
    title_en = request.form.get('title_en', '').strip()
    title_si = request.form.get('title_si', '').strip()
    title_ta = request.form.get('title_ta', '').strip()
    summary_en = request.form.get('summary_en', '').strip()
    summary_si = request.form.get('summary_si', '').strip()
    summary_ta = request.form.get('summary_ta', '').strip()
    category = request.form.get('category', '').strip()
    status = request.form.get('status', '').strip()
    # ordering metadata
    featured = bool(request.form.get('featured'))
    try:
        priority = int(request.form.get('priority', '0').strip() or '0')
    except Exception:
        priority = 0
    tags_csv = request.form.get('tags', '').strip()
    tags = [t.strip() for t in tags_csv.split(',') if t.strip()] if tags_csv else []
    publish_now = bool(request.form.get('publish_now'))

    # stats
    stat1_number = request.form.get('stat1_number', '').strip()
    stat1_label_en = request.form.get('stat1_label_en', '').strip()
    stat1_label_si = request.form.get('stat1_label_si', '').strip()
    stat1_label_ta = request.form.get('stat1_label_ta', '').strip()

    stat2_number = request.form.get('stat2_number', '').strip()
    stat2_label_en = request.form.get('stat2_label_en', '').strip()
    stat2_label_si = request.form.get('stat2_label_si', '').strip()
    stat2_label_ta = request.form.get('stat2_label_ta', '').strip()

    # optional long descriptions
    long_en = request.form.get('long_en', '').strip()
    long_si = request.form.get('long_si', '').strip()
    long_ta = request.form.get('long_ta', '').strip()

    if not proj_id:
        return 'Missing project id (form field name: id).', 400

    projects = _load_projects()
    if any(str(p.get('id')) == proj_id for p in projects):
        return f"Project with id '{proj_id}' already exists.", 400

    # Create per-project upload dir
    proj_dir = os.path.join(UPLOAD_ROOT, 'projects', secure_filename(proj_id))
    os.makedirs(proj_dir, exist_ok=True)

    # main image
    main_image_url = ''
    image = request.files.get('image')
    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        base, ext = os.path.splitext(filename)
        dest_path = os.path.join(proj_dir, filename)
        i = 1
        while os.path.exists(dest_path):
            filename = f"{base}-{i}{ext}"
            dest_path = os.path.join(proj_dir, filename)
            i += 1
        image.save(dest_path)
        main_image_url = f"/uploads/projects/{secure_filename(proj_id)}/{filename}"
    else:
        main_image_url = request.form.get('image_url', '').strip()

    # additional gallery images (up to 15)
    gallery_urls = []
    gallery_files = request.files.getlist('gallery_images')
    for gf in gallery_files[:15]:
        if gf and allowed_file(gf.filename):
            gfn = secure_filename(gf.filename)
            base, ext = os.path.splitext(gfn)
            dest_path = os.path.join(proj_dir, gfn)
            j = 1
            while os.path.exists(dest_path):
                gfn = f"{base}-{j}{ext}"
                dest_path = os.path.join(proj_dir, gfn)
                j += 1
            gf.save(dest_path)
            gallery_urls.append(f"/uploads/projects/{secure_filename(proj_id)}/{gfn}")

    new_project = {
        'id': proj_id,
        'title': {'en': title_en, 'si': title_si, 'ta': title_ta},
        'summary': {'en': summary_en, 'si': summary_si, 'ta': summary_ta},
        'category': category,
        'status': status,
        'featured': featured,
        'priority': priority,
        'main_image': main_image_url,
        'gallery_images': gallery_urls,
        'tags': tags,
        'published': publish_now,
        'stat1': {'number': stat1_number or '', 'label': {'en': stat1_label_en, 'si': stat1_label_si, 'ta': stat1_label_ta}},
        'stat2': {'number': stat2_number or '', 'label': {'en': stat2_label_en, 'si': stat2_label_si, 'ta': stat2_label_ta}},
    }

    if long_en or long_si or long_ta:
        new_project['longDescription'] = {'en': long_en, 'si': long_si, 'ta': long_ta}

    projects.append(new_project)
    _save_projects(projects)
    if publish_now:
        _write_public_projects(projects)

    return redirect(url_for('admin_index'))


if __name__ == '__main__':
    # Run on localhost port 5000 for admin use only
    # Use debug=False and disable the reloader to avoid subprocesses that
    # can make the server unreachable when launched in background.
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
