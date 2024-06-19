from flask import Flask, render_template, jsonify, request, send_from_directory, abort
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt
from werkzeug.utils import secure_filename
from api.video_api import get_log_messages, get_user_attributes, get_videos, get_video_details, add_video, update_video, delete_video, update_attributes
from api.stats_api import get_all_lenghts, refresh_stats, get_stats_logs, get_stats
from auth.auth import verify_user, add_token_to_blacklist, init_jwt
from config import config
import os

env = os.getenv('FLASK_ENV', 'development')
app_config = config[env]
app = Flask(__name__)
app.config.from_object(app_config)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": app.config['CORS_ORIGINS']}})

# Define the folder for thumbnails
THUMBNAIL_FOLDER = os.path.join(app.root_path, 'static', 'thumbnails')
app.config['THUMBNAIL_FOLDER'] = THUMBNAIL_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

init_jwt(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/videos', methods=['GET', 'POST'])
@jwt_required()
def videos():
    if request.method == 'POST':
        video = request.json
        video_id = add_video(video)
        return jsonify({'id': video_id}), 201
    else:
        return jsonify(get_videos())

@app.route('/api/videos/<int:video_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def video_details_route(video_id):
    if request.method == 'GET':
        video = get_video_details(video_id)
        if video:
            return jsonify(video)
        else:
            abort(404)
    elif request.method == 'PUT':
        video = request.json
        rows_updated = update_video(video_id, video)
        if rows_updated:
            return jsonify({'msg': 'Video updated successfully'})
        else:
            abort(404)
    elif request.method == 'DELETE':
        rows_deleted = delete_video(video_id)
        if rows_deleted:
            return jsonify({'msg': 'Video deleted successfully'})
        else:
            abort(404)

@app.route('/thumbnails/<filename>')
def get_thumbnail(filename):
    return send_from_directory(app.config['THUMBNAIL_FOLDER'], filename)

@app.route('/upload-thumbnail', methods=['POST'])
@jwt_required()
def upload_thumbnail():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['THUMBNAIL_FOLDER'], filename))
        return jsonify({'filename': filename}), 201
    else:
        return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/videos/<int:video_id>/attributes', methods=['POST'])
@jwt_required()
def update_attributes_route(video_id):
    return update_attributes(video_id)

@app.route('/api/videos/<string:video_id>/logs', methods=['GET'])
@jwt_required()
def get_video_logs(video_id):
    logs = get_log_messages(video_id)
    return jsonify({'logs': logs})

@app.route('/api/stats/refresh', methods=['GET'])
@jwt_required()
def refresh_stats_route():
    return refresh_stats()

@app.route('/api/stats/logs', methods=['GET'])
@jwt_required()
def get_stats_logs_route():
    return get_stats_logs()

@app.route('/api/stats/<string:stats_type>', methods=['GET'])
@jwt_required()
def get_stats_route(stats_type):
    return get_stats(stats_type)

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    user = verify_user(username, password)
    if not user:
        return jsonify({"msg": "Bad username or password"}), 401
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    add_token_to_blacklist(jti)
    return jsonify({"msg": "Successfully logged out"}), 200

@app.route('/api/verify_token', methods=['GET'])
@jwt_required()
def verify_token():
    return jsonify({"msg": "Token is valid"}), 200

@app.route('/api/config/user-attributes', methods=['GET'])
@jwt_required()
def get_user_attributes_route():
    return get_user_attributes()

@app.route('/api/total_length_per_day', methods=['GET'])
@jwt_required()
def get_total_length_per_day():
    total_length_per_day = get_all_lenghts()
    return jsonify(total_length_per_day)

if __name__ == '__main__':
    app.run(debug=True)
