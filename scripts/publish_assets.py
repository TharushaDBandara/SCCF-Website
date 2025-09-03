import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER_UPLOADS = ROOT / 'server' / 'uploads'
ASSETS_UPLOADS = ROOT / 'assets' / 'uploads'
PROJECTS_JSON = ROOT / 'assets' / 'projects.json'

# Copy server/uploads -> assets/uploads (mirror)
def copy_uploads():
    if not SERVER_UPLOADS.exists():
        print(f"[warn] No server/uploads found at {SERVER_UPLOADS}")
        return
    for src_dir, _, files in os.walk(SERVER_UPLOADS):
        rel = os.path.relpath(src_dir, SERVER_UPLOADS)
        dst_dir = ASSETS_UPLOADS / rel
        dst_dir.mkdir(parents=True, exist_ok=True)
        for f in files:
            s = Path(src_dir) / f
            d = dst_dir / f
            # Only copy if newer or missing
            if not d.exists() or s.stat().st_mtime > d.stat().st_mtime:
                shutil.copy2(s, d)
                print(f"[copy] {s} -> {d}")

# Rewrite paths in projects.json from /uploads to assets/uploads

def rewrite_projects_json():
    if not PROJECTS_JSON.exists():
        print(f"[warn] No {PROJECTS_JSON}")
        return
    data = json.loads(PROJECTS_JSON.read_text(encoding='utf-8'))
    changed = False
    def map_url(u):
        nonlocal changed
        if isinstance(u, str) and u.startswith('/uploads/'):
            changed = True
            return 'assets' + u
        return u

    for proj in data:
        if 'main_image' in proj:
            proj['main_image'] = map_url(proj['main_image'])
        if 'image' in proj:
            proj['image'] = map_url(proj['image'])
        if 'gallery_images' in proj and isinstance(proj['gallery_images'], list):
            proj['gallery_images'] = [map_url(x) for x in proj['gallery_images']]
    if changed:
        PROJECTS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f"[update] Rewrote paths in {PROJECTS_JSON}")
    else:
        print("[info] No paths to rewrite in projects.json")

if __name__ == '__main__':
    ASSETS_UPLOADS.mkdir(parents=True, exist_ok=True)
    copy_uploads()
    rewrite_projects_json()
    print('[done] publish assets complete')
