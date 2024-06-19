import os
import sqlite3
from flask_jwt_extended import get_jwt_identity
import yt_dlp
import requests
import threading
import time
import sys
from flask import url_for, request, jsonify
from database import create_connection
import time
import os
import json

LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static', 'logs'))

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)


def get_videos():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    conn = create_connection()
    cur = conn.cursor()
    search_text = request.args.get('searchText', None)
    start_date = request.args.get('startDate', None)
    end_date = request.args.get('endDate', None)
    query = "SELECT id, url, title, thumbnail, description, timestamp FROM videos WHERE 1=1"
    params = []

    if search_text:
        query += " AND title LIKE ?"
        params.append(f"%{search_text}%")

    if start_date:
        query += " AND timestamp >= ?"
        params.append(int(start_date))
    if end_date:
        query += " AND timestamp <= ?"
        params.append(int(end_date))

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    return [dict(
        id=row[0], 
        url=row[1], 
        title=row[2], 
        thumbnail=url_for('get_thumbnail', filename=row[3], _external=True),
        description=row[4],
        timestamp=row[5]
    ) for row in rows]

def get_video_details(video_id):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, url, title, thumbnail, description, timestamp FROM videos WHERE id=?", (video_id,))
    video_row = cur.fetchone()
    
    cur.execute("SELECT attributes FROM data WHERE video_id=?", (video_id,))
    attributes_row = cur.fetchone()
    
    conn.close()
    
    if video_row:
        attributes = json.loads(attributes_row[0]) if attributes_row else []
        return dict(
            id=video_row[0], 
            url=video_row[1], 
            title=video_row[2], 
            thumbnail=url_for('get_thumbnail', filename=video_row[3], _external=True),
            description=video_row[4],  
            timestamp=video_row[5],  
            attributes=attributes
        )
    else:
        return None

def add_video(video):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO videos (url, title, thumbnail, description, timestamp) VALUES (?, ?, ?, ?, ?)",  # Ensure timestamp is included here
                (video['url'], video['title'], video['thumbnail'], video['description'], video['timestamp']))
    conn.commit()
    conn.close()
    return cur.lastrowid

def update_video(video_id, video):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("UPDATE videos SET url=?, title=?, thumbnail=?, description=?, timestamp=? WHERE id=?",  # Ensure timestamp is included here
                (video['url'], video['title'], video['thumbnail'], video['description'], video['timestamp'], video_id))
    conn.commit()
    conn.close()
    return cur.rowcount

def delete_video(video_id):
    conn = create_connection() 
    cur = conn.cursor()
    
    # Delete from data table first
    cur.execute("DELETE FROM data WHERE video_id=?", (video_id,))
    
    # Then delete from videos table
    cur.execute("DELETE FROM videos WHERE id=?", (video_id,))
    conn.commit()
    conn.close()
    return cur.rowcount

def save_attributes(video_id, attributes, username):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT attributes FROM data WHERE video_id=?", (video_id,))
    row = cur.fetchone()
    
    if row:
        existing_data = json.loads(row[0])
        for entry in existing_data:
            if entry['username'] == username:
                entry['attributes'] = attributes
                break
        else:
            existing_data.append({'username': username, 'attributes': attributes})
        
        cur.execute("UPDATE data SET attributes=? WHERE video_id=?", (json.dumps(existing_data), video_id))
    else:
        new_data = [{'username': username, 'attributes': attributes}]
        cur.execute("INSERT INTO data (video_id, attributes) VALUES (?, ?)", (video_id, json.dumps(new_data)))
    
    conn.commit()
    conn.close()

def update_attributes(video_id):
    data = request.json
    attributes = data.get('attributes')
    username = get_jwt_identity()  # Extract the username from the JWT token
    if attributes is not None and username is not None:
        save_attributes(video_id, attributes, username)
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'No attributes or username provided'}), 400

def insert_video(video_data):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO videos (url, title, description, length, thumbnail, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (video_data['url'], video_data['title'], video_data['description'], video_data['length'], video_data['thumbnail'], video_data['timestamp']))
    conn.commit()
    conn.close()

def video_exists(url):
    conn = create_connection()
    cur = conn.cursor()
    cur.execute('SELECT 1 FROM videos WHERE url = ?', (url,))
    results = cur.fetchall()
    exists = len(results) > 0
    conn.close()
    return exists

def add_video(video):
    video_id = video['url'].split('/')[-1]  # Extract video ID from the URL
    log_file = os.path.join(LOG_DIR, f"{video_id}.log")

    if video_exists(video['url']):
        return None, "Video already added"

    def write_logs():
        # Redirect stdout to the log file
        original_stdout = sys.stdout
        with open(log_file, 'w') as f:
            sys.stdout = f

            print("Starting the process...")

            try:
                ydl_opts = {
                    'format': 'best',
                    'quiet': True,
                    'skip_download': True,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    print("Fetching video info...")
                    info = ydl.extract_info(video['url'], download=False)

                    video_data = {
                        'url': video['url'],
                        'title': info.get('title'),
                        'description': info.get('description'),
                        'length': info.get('duration'),  # Length in seconds
                        'thumbnail': f'{video_id}.jpg',
                        'timestamp': info.get('timestamp')  # Timestamp when video went live
                    }

                    thumbnail_url = info.get('thumbnail')
                    thumbnail_path = os.path.join(LOG_DIR, '..', 'thumbnails', video_data['thumbnail'])

                    print("Downloading thumbnail...")
                    response = requests.get(thumbnail_url)
                    if response.status_code == 200:
                        with open(thumbnail_path, 'wb') as thumb_file:
                            thumb_file.write(response.content)
                        print("Thumbnail downloaded successfully.")

                        print("Video info:")
                        print(f"URL: {video_data['url']}")
                        print(f"Title: {video_data['title']}")
                        print(f"Description: {video_data['description']}")
                        print(f"Length: {video_data['length']}")
                        print(f"Thumbnail: {video_data['thumbnail']}")
                        print(f"Timestamp: {video_data['timestamp']}")

                        # Insert data into the database
                        print("Inserting video into the database...")
                        insert_video(video_data)

                        print("Video processing complete.")
                    else:
                        print("Failed to download thumbnail.")

            except Exception as e:
                print(f"Error processing video: {e}")

            finally:
                # Restore original stdout
                sys.stdout = original_stdout

    threading.Thread(target=write_logs).start()
    return video_id, None

def get_log_messages(video_id):
    log_file = os.path.join(LOG_DIR, f"{video_id}.log")
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            return f.readlines()
    return []

def get_user_attributes():
    conn = create_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM config WHERE settings = 'USER_ATTRIBUTES'")
    row = cur.fetchone()
    conn.close()

    if row:
        user_attributes = json.loads(row[0])
        return jsonify(user_attributes)
    else:
        return jsonify([]), 404