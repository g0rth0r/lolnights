import sqlite3
from sqlite3 import Error

def create_connection():
    """ create a database connection to the SQLite database """
    conn = None
    try:
        conn = sqlite3.connect('videos.db')
    except Error as e:
        print(e)
    return conn

def create_table():
    """ create a table for storing video details """
    conn = create_connection()
    try:
        with conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS videos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL,
                    title TEXT NOT NULL,
                    thumbnail TEXT NOT NULL
                );
            ''')
    except Error as e:
        print(e)
    finally:
        if conn:
            conn.close()

# Create the table when the script runs
create_table()
