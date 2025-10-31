# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads/news'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Data file path
DATA_FILE = 'data/news.json'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_news():
    """Load news from JSON file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_news(news):
    """Save news to JSON file"""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(news, f, indent=2, ensure_ascii=False)

def save_uploaded_file(file):
    """Save uploaded file and return relative path"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add unique ID to prevent collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        return f"/uploads/news/{unique_filename}"
    return None

@app.route('/')
def admin():
    """Admin panel page"""
    return render_template('news-admin.html')

@app.route('/api/news', methods=['GET'])
def get_news():
    """Get all news articles"""
    news = load_news()
    return jsonify(news)

@app.route('/api/news/<news_id>', methods=['GET'])
def get_news_by_id(news_id):
    """Get a specific news article"""
    news = load_news()
    article = next((n for n in news if n['id'] == news_id), None)
    
    if article:
        return jsonify(article)
    return jsonify({'error': 'Article not found'}), 404

@app.route('/api/news', methods=['POST'])
def create_news():
    """Create a new news article"""
    try:
        # Generate unique ID
        news_id = str(uuid.uuid4())
        
        # Get form data
        title = request.form.get('title', '')
        category = request.form.get('category', '')
        author = request.form.get('author', 'SCCF Team')
        excerpt = request.form.get('excerpt', '')
        content = request.form.get('content', '')
        
        if not title or not content or not category:
            return jsonify({'error': 'Title, category, and content are required'}), 400
        
        # Handle image upload
        image_path = None
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file.filename:
                image_path = save_uploaded_file(image_file)
        
        # Handle additional images upload
        additional_images = []
        if 'additional-images' in request.files:
            files = request.files.getlist('additional-images')
            for file in files:
                if file.filename:
                    img_path = save_uploaded_file(file)
                    if img_path:
                        additional_images.append(img_path)
        
        # Create article object
        article = {
            'id': news_id,
            'title': title,
            'category': category,
            'author': author,
            'excerpt': excerpt,
            'content': content,
            'image': image_path,
            'images': additional_images,
            'date': datetime.now().isoformat()
        }
        
        # Load existing news and add new article
        news = load_news()
        news.append(article)
        save_news(news)
        
        return jsonify({'message': 'Article created successfully', 'id': news_id}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news/<news_id>', methods=['PUT'])
def update_news(news_id):
    """Update an existing news article"""
    try:
        news = load_news()
        article = next((n for n in news if n['id'] == news_id), None)
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Update fields
        article['title'] = request.form.get('title', article['title'])
        article['category'] = request.form.get('category', article['category'])
        article['author'] = request.form.get('author', article['author'])
        article['excerpt'] = request.form.get('excerpt', article['excerpt'])
        article['content'] = request.form.get('content', article['content'])
        
        # Handle image upload
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file.filename:
                image_path = save_uploaded_file(image_file)
                if image_path:
                    article['image'] = image_path
        
        # Handle additional images upload
        if 'additional-images' in request.files:
            files = request.files.getlist('additional-images')
            new_images = []
            for file in files:
                if file.filename:
                    img_path = save_uploaded_file(file)
                    if img_path:
                        new_images.append(img_path)
            
            # Append new images to existing ones
            if 'images' not in article:
                article['images'] = []
            article['images'].extend(new_images)
        
        save_news(news)
        
        return jsonify({'message': 'Article updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news/<news_id>', methods=['DELETE'])
def delete_news(news_id):
    """Delete a news article"""
    try:
        news = load_news()
        article = next((n for n in news if n['id'] == news_id), None)
        
        if not article:
            return jsonify({'error': 'Article not found'}), 404
        
        # Remove article from list
        news = [n for n in news if n['id'] != news_id]
        save_news(news)
        
        # Optionally delete image file
        if article.get('image'):
            try:
                image_path = article['image'].lstrip('/')
                if os.path.exists(image_path):
                    os.remove(image_path)
            except:
                pass
        
        # Delete additional images
        if article.get('images'):
            for img in article['images']:
                try:
                    img_path = img.lstrip('/')
                    if os.path.exists(img_path):
                        os.remove(img_path)
                except:
                    pass
        
        return jsonify({'message': 'Article deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/news/<filename>')
def uploaded_file(filename):
    """Serve uploaded images"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
