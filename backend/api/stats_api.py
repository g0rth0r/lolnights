import os
import time
import sqlite3
from flask import jsonify
import json
from datetime import datetime, timezone

LOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'static', 'logs')
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'videos.db')

def get_current_time():
    return time.strftime('%Y-%m-%d %H:%M:%S')

def get_stats_logs():
    log_file = os.path.join(LOG_DIR, 'stats.log')
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            lines = f.readlines()
        return jsonify({'logs': lines[-20:]})
    return jsonify({'logs': []})

def get_stats(stats_type):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if stats_type in ['video_start_time_distribution','top_10_longest_videos','video_frequencies', 'total_length_per_day', 'rolling_avg_length_per_day', 'videos_per_day_of_week']:
        cursor.execute('SELECT data FROM stats WHERE name = ?', (stats_type,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return jsonify({'data': json.loads(row[0])})
    
    conn.close()
    return jsonify({'data': []})

def create_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def recreate_stats_table(cursor):
    cursor.execute('DROP TABLE IF EXISTS stats')
    cursor.execute('''
        CREATE TABLE stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            data TEXT NOT NULL
        )
    ''')

def insert_stats(cursor, name, data):
    cursor.execute('''
        INSERT INTO stats (name, data)
        VALUES (?, ?)
    ''', (name, json.dumps(data)))

def calculate_video_frequencies(cursor):
    cursor.execute('SELECT timestamp FROM videos')
    rows = cursor.fetchall()
    frequencies = {}

    for row in rows:
        timestamp = row[0]
        date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        month_year = date.strftime('%Y-%m')

        if month_year not in frequencies:
            frequencies[month_year] = 0
        frequencies[month_year] += 1

    return frequencies

def get_all_lenghts():
    conn = create_connection()
    cursor = conn.cursor()
    total_length_per_day = calculate_total_length_per_day(cursor)
    return total_length_per_day
 

def calculate_total_length_per_day(cursor):
    cursor.execute('SELECT timestamp, length FROM videos')
    rows = cursor.fetchall()
    total_length_per_day = {}

    for row in rows:
        timestamp, length = row
        date = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime('%Y-%m-%d')

        if date not in total_length_per_day:
            total_length_per_day[date] = 0
        total_length_per_day[date] += length

    return total_length_per_day

def calculate_rolling_average_length(cursor, window=7):
    total_length_per_day = calculate_total_length_per_day(cursor)
    sorted_dates = sorted(total_length_per_day.keys())
    rolling_avg_length_per_day = {}
    length_list = []

    for date in sorted_dates:
        length_list.append(total_length_per_day[date])
        if len(length_list) > window:
            length_list.pop(0)
        rolling_avg_length_per_day[date] = sum(length_list) / len(length_list)

    return rolling_avg_length_per_day

def calculate_videos_per_day_of_week(cursor):
    cursor.execute('SELECT timestamp FROM videos')
    rows = cursor.fetchall()
    days_of_week = {
        'Sunday': 0,
        'Monday': 0,
        'Tuesday': 0,
        'Wednesday': 0,
        'Thursday': 0,
        'Friday': 0,
        'Saturday': 0,
    }

    for row in rows:
        timestamp = row[0]
        date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        day_name = date.strftime('%A')
        days_of_week[day_name] += 1

    return days_of_week

def calculate_top_10_longest_videos(cursor):
    cursor.execute('SELECT id, title, length, timestamp FROM videos ORDER BY length DESC LIMIT 10')
    rows = cursor.fetchall()
    top_10_longest_videos = [{'id': row[0], 'title': row[1], 'length': row[2], 'timestamp': datetime.fromtimestamp(row[3], tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} for row in rows]
    return top_10_longest_videos

def calculate_video_start_time_distribution(cursor):
    cursor.execute('SELECT timestamp FROM videos')
    rows = cursor.fetchall()
    bins = {}
    for hour in range(24):
        for minute in range(0, 60, 10):
            bin_label = f"{hour:02}:{minute:02}"
            bins[bin_label] = 0

    for row in rows:
        timestamp = row[0]
        dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        bin_label = f"{dt.hour:02}:{(dt.minute // 10) * 10:02}"
        bins[bin_label] += 1

    video_start_time_distribution = [{'time_bin': bin, 'count': count} for bin, count in bins.items()]
    return video_start_time_distribution

def refresh_stats():
    log_file = os.path.join(LOG_DIR, 'stats.log')
    conn = create_connection()
    cursor = conn.cursor()

    def log_message(message):
        with open(log_file, 'a') as f:
            f.write(f"[{get_current_time()}] {message}\n")

    try:
        log_message("Starting stats refresh...")

        recreate_stats_table(cursor)
        log_message("Stats table recreated.")

        frequencies = calculate_video_frequencies(cursor)
        insert_stats(cursor, 'video_frequencies', frequencies)
        log_message("Video frequencies calculated and inserted.")

        total_length_per_day = calculate_total_length_per_day(cursor)
        insert_stats(cursor, 'total_length_per_day', total_length_per_day)
        log_message("Total length per day calculated and inserted.")

        rolling_avg_length = calculate_rolling_average_length(cursor)
        insert_stats(cursor, 'rolling_avg_length_per_day', rolling_avg_length)
        log_message("Rolling average length per day calculated and inserted.")

        videos_per_day_of_week = calculate_videos_per_day_of_week(cursor)
        insert_stats(cursor, 'videos_per_day_of_week', videos_per_day_of_week)
        log_message("Videos per day of week calculated and inserted.")

        top_10_longest_videos = calculate_top_10_longest_videos(cursor)
        insert_stats(cursor, 'top_10_longest_videos', top_10_longest_videos)
        log_message("Top 10 longest videos calculated and inserted.")

        video_start_time_distribution = calculate_video_start_time_distribution(cursor)
        insert_stats(cursor, 'video_start_time_distribution', video_start_time_distribution)
        log_message("Video start time distribution calculated and inserted.")

        conn.commit()
        log_message("Stats refresh completed successfully.")
    except Exception as e:
        log_message(f"Error during stats refresh: {str(e)}")
    finally:
        conn.close()

    return jsonify({'message': 'Stats refresh started.'}), 200
