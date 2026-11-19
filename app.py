import os
import re
import secrets
from datetime import datetime, timedelta
from pathlib import Path

from flask import Flask, jsonify, request, session, send_from_directory, url_for
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'}
VALID_PRIORITIES = {'low', 'medium', 'high', 'urgent'}
VALID_STATUSES = {'pending', 'in_progress', 'resolved', 'closed'}
VALID_CATEGORIES = {
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Furniture',
    'Internet',
    'Security',
    'Other',
}
MAX_UPLOAD_SIZE_MB = 5
EMAIL_REGEX = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
app.config['UPLOAD_FOLDER'] = str(UPLOAD_DIR)
app.config['MAX_CONTENT_LENGTH'] = MAX_UPLOAD_SIZE_MB * 1024 * 1024

# MongoDB setup
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/hostel_portal')
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client.get_default_database()

cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {"origins": cors_origins},
        r"/uploads/*": {"origins": cors_origins},
    },
)


def get_next_sequence_value(sequence_name: str) -> int:
    counter = mongo_db.counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    return counter["sequence_value"]


class User:
    def __init__(self, id, username, email, password_hash, role, room_number=None, created_at=None, profile_photo=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.room_number = room_number
        self.created_at = created_at or datetime.utcnow()
        self.profile_photo = profile_photo

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "room_number": self.room_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "profile_photo_url": url_for('serve_upload', filename=self.profile_photo, _external=True)
            if self.profile_photo
            else None,
        }

    @staticmethod
    def from_dict(doc: dict) -> 'User':
        return User(
            id=doc["_id"],
            username=doc["username"],
            email=doc["email"],
            password_hash=doc["password_hash"],
            role=doc["role"],
            room_number=doc.get("room_number"),
            created_at=doc.get("created_at"),
            profile_photo=doc.get("profile_photo"),
        )


def save_user(user: User):
    mongo_db.users.update_one(
        {"_id": user.id},
        {"$set": {
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "role": user.role,
            "room_number": user.room_number,
            "created_at": user.created_at,
            "profile_photo": user.profile_photo
        }},
        upsert=True
    )


class Complaint:
    def __init__(self, id, title, description, category, priority, status, student_id, warden_notes=None, issue_photo=None, resolution_photo=None, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.description = description
        self.category = category
        self.priority = priority
        self.status = status
        self.student_id = student_id
        self.warden_notes = warden_notes
        self.issue_photo = issue_photo
        self.resolution_photo = resolution_photo
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self) -> dict:
        student_doc = mongo_db.users.find_one({"_id": self.student_id})
        student_data = {
            "id": student_doc["_id"],
            "username": student_doc["username"],
            "room_number": student_doc.get("room_number"),
        } if student_doc else None

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "student_id": self.student_id,
            "student": student_data,
            "warden_notes": self.warden_notes,
            "issue_photo_url": url_for('serve_upload', filename=self.issue_photo, _external=True) if self.issue_photo else None,
            "resolution_photo_url": url_for('serve_upload', filename=self.resolution_photo, _external=True) if self.resolution_photo else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @staticmethod
    def from_dict(doc: dict) -> 'Complaint':
        return Complaint(
            id=doc["_id"],
            title=doc["title"],
            description=doc["description"],
            category=doc["category"],
            priority=doc.get("priority", "medium"),
            status=doc.get("status", "pending"),
            student_id=doc["student_id"],
            warden_notes=doc.get("warden_notes"),
            issue_photo=doc.get("issue_photo"),
            resolution_photo=doc.get("resolution_photo"),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at"),
        )


def save_complaint(complaint: Complaint):
    mongo_db.complaints.update_one(
        {"_id": complaint.id},
        {"$set": {
            "title": complaint.title,
            "description": complaint.description,
            "category": complaint.category,
            "priority": complaint.priority,
            "status": complaint.status,
            "student_id": complaint.student_id,
            "warden_notes": complaint.warden_notes,
            "issue_photo": complaint.issue_photo,
            "resolution_photo": complaint.resolution_photo,
            "created_at": complaint.created_at,
            "updated_at": complaint.updated_at
        }},
        upsert=True
    )


class PasswordReset:
    def __init__(self, id, user_id, token, expires_at, used=False, created_at=None):
        self.id = id
        self.user_id = user_id
        self.token = token
        self.expires_at = expires_at
        self.used = used
        self.created_at = created_at or datetime.utcnow()

    @property
    def user(self) -> User | None:
        user_doc = mongo_db.users.find_one({"_id": self.user_id})
        return User.from_dict(user_doc) if user_doc else None

    def is_valid(self) -> bool:
        return not self.used and datetime.utcnow() < self.expires_at

    @staticmethod
    def from_dict(doc: dict) -> 'PasswordReset':
        return PasswordReset(
            id=doc["_id"],
            user_id=doc["user_id"],
            token=doc["token"],
            expires_at=doc["expires_at"],
            used=doc.get("used", False),
            created_at=doc.get("created_at")
        )


def save_password_reset(pr: PasswordReset):
    mongo_db.password_resets.update_one(
        {"_id": pr.id},
        {"$set": {
            "user_id": pr.user_id,
            "token": pr.token,
            "expires_at": pr.expires_at,
            "used": pr.used,
            "created_at": pr.created_at
        }},
        upsert=True
    )


def current_user() -> User | None:
    user_id = session.get('user_id')
    if not user_id:
        return None
    user_doc = mongo_db.users.find_one({"_id": user_id})
    return User.from_dict(user_doc) if user_doc else None


def build_stats(complaints: list[Complaint]) -> dict:
    stats = {
        "total": len(complaints),
        "pending": 0,
        "in_progress": 0,
        "resolved": 0,
        "closed": 0,
    }
    for complaint in complaints:
        if complaint.status in stats:
            stats[complaint.status] += 1
    return stats


def error_response(message: str, status: int = 400):
    return jsonify({"error": message}), status


def extract_request_data():
    if request.content_type and 'multipart/form-data' in request.content_type:
        return request.form
    return request.get_json() or {}


def sanitize_text(value: str | None) -> str:
    return (value or '').strip()


def allowed_file(filename: str) -> bool:
    return bool(filename and filename.rsplit('.', 1)[-1].lower() in ALLOWED_EXTENSIONS)


def save_uploaded_file(file_storage, prefix: str) -> str:
    if not file_storage or file_storage.filename == '':
        return ''
    filename = secure_filename(file_storage.filename)
    if not allowed_file(filename):
        raise ValueError("Only image uploads are allowed (png, jpg, jpeg, gif, webp, bmp).")
    extension = filename.rsplit('.', 1)[-1].lower()
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    new_filename = f"{prefix}_{timestamp}.{extension}"
    upload_path = Path(app.config['UPLOAD_FOLDER']) / new_filename
    upload_path.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(upload_path)
    return new_filename



@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"})


@app.route('/uploads/<path:filename>')
def serve_upload(filename: str):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/auth/session', methods=['GET'])
def session_info():
    user = current_user()
    return jsonify({"user": user.to_dict() if user else None})


@app.route('/api/profile', methods=['GET', 'PUT'])
def profile():
    user = current_user()
    if not user:
        return error_response("Authentication required.", 401)

    if request.method == 'GET':
        return jsonify({"user": user.to_dict()})

    data = extract_request_data()
    if user.role == 'student' and 'room_number' in data:
        room_value = sanitize_text(data.get('room_number'))
        if room_value:
            user.room_number = room_value

    profile_photo = request.files.get('profile_photo')
    if profile_photo:
        try:
            user.profile_photo = save_uploaded_file(profile_photo, f"profile_{user.id}")
        except ValueError as exc:
            return error_response(str(exc))

    save_user(user)
    return jsonify({"message": "Profile updated.", "user": user.to_dict()})


@app.route('/api/register', methods=['POST'])
def register():
    data = extract_request_data()
    username = sanitize_text(data.get('username'))
    email = sanitize_text(data.get('email')).lower()
    password = (data.get('password') or '').strip()
    role = data.get('role', 'student')
    room_number = sanitize_text(data.get('room_number'))

    if not username or not email or not password:
        return error_response("Please fill in all required fields.")

    if len(username) < 8:
        return error_response("Username must be at least 8 characters long.")

    if not EMAIL_REGEX.match(email):
        return error_response("Please enter a valid email address.")

    if len(password) < 6:
        return error_response("Password must be at least 6 characters long.")

    if role not in ('student', 'warden'):
        return error_response("Invalid role.", 422)

    if role == 'student' and not room_number:
        return error_response("Room number is required for students.")

    if mongo_db.users.find_one({"username": username}):
        return error_response("Username already exists.", 409)

    if mongo_db.users.find_one({"email": email}):
        return error_response("Email already registered.", 409)

    next_id = get_next_sequence_value("users")
    user = User(
        id=next_id,
        username=username,
        email=email,
        role=role,
        room_number=room_number if role == 'student' else None,
        password_hash=''
    )
    user.set_password(password)
    save_user(user)

    return jsonify({"message": "Registration successful. Please login."}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = extract_request_data()
    username = sanitize_text(data.get('username'))
    password = (data.get('password') or '').strip()

    if not username or not password:
        return error_response("Please enter your username and password.")

    user_doc = mongo_db.users.find_one({"username": username})

    if not user_doc:
        return error_response("Invalid username or password.", 401)

    user = User.from_dict(user_doc)
    if not user.check_password(password):
        return error_response("Invalid username or password.", 401)

    session['user_id'] = user.id
    session['username'] = user.username
    session['role'] = user.role

    return jsonify({"message": "Login successful.", "user": user.to_dict()})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."})


@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = extract_request_data()
    identifier = sanitize_text(data.get('username') or data.get('email') or '').strip()
    
    if not identifier:
        return error_response("Please enter your username or email address.")
    
    # Try to find user by username or email
    user_doc = mongo_db.users.find_one({
        "$or": [
            {"username": identifier},
            {"email": identifier.lower()}
        ]
    })
    
    # For security, always return success even if user not found
    if not user_doc:
        return jsonify({
            "message": "If an account exists with that username or email, a password reset link has been sent.",
            "token": None  # Don't expose whether user exists
        })
    
    user = User.from_dict(user_doc)
    
    # Generate a secure token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
    
    # Create password reset record
    next_id = get_next_sequence_value("password_resets")
    password_reset = PasswordReset(
        id=next_id,
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    save_password_reset(password_reset)
    
    # For development, return the token to show on screen
    frontend_base = request.headers.get('Origin') or request.host_url.rstrip('/')
    reset_url = f"{frontend_base}/reset-password?token={token}"
    
    return jsonify({
        "message": "Password reset link generated successfully.",
        "token": token,  # DEV ONLY: Remove in production
        "reset_url": reset_url,  # DEV ONLY: Remove in production
        "expires_at": expires_at.isoformat()
    })


@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = extract_request_data()
    token = data.get('token', '').strip()
    new_password = (data.get('password') or '').strip()
    
    if not token:
        return error_response("Reset token is required.")
    
    if not new_password:
        return error_response("Please enter a new password.")
    
    if len(new_password) < 6:
        return error_response("Password must be at least 6 characters long.")
    
    # Find the password reset record
    pr_doc = mongo_db.password_resets.find_one({"token": token})
    
    if not pr_doc:
        return error_response("Invalid or expired reset token.", 400)
    
    password_reset = PasswordReset.from_dict(pr_doc)
    if not password_reset.is_valid():
        return error_response("Reset token has expired or has already been used.", 400)
    
    # Update user password
    user = password_reset.user
    if user:
        user.set_password(new_password)
        save_user(user)
    
    # Mark token as used
    password_reset.used = True
    save_password_reset(password_reset)
    
    return jsonify({"message": "Password has been reset successfully. Please login with your new password."})


@app.route('/api/complaints', methods=['GET', 'POST'])
def complaints_collection():
    user = current_user()
    if not user:
        return error_response("Authentication required.", 401)

    if request.method == 'POST':
        if user.role != 'student':
            return error_response("Only students can submit complaints.", 403)

        data = extract_request_data()
        title = sanitize_text(data.get('title'))
        description = sanitize_text(data.get('description'))
        category = sanitize_text(data.get('category'))
        priority = sanitize_text(data.get('priority') or 'medium').lower()

        if len(title) < 5:
            return error_response("Title must be at least 5 characters long.")
        if len(description) < 20:
            return error_response("Description must be at least 20 characters long.")
        if category not in VALID_CATEGORIES:
            return error_response("Please select a valid category.")
        if priority not in VALID_PRIORITIES:
            return error_response("Please select a valid priority value.")

        issue_photo_file = request.files.get('issue_photo')
        issue_photo_filename = ''
        if issue_photo_file:
            try:
                issue_photo_filename = save_uploaded_file(issue_photo_file, f"issue_{user.id}")
            except ValueError as exc:
                return error_response(str(exc))

        next_id = get_next_sequence_value("complaints")
        complaint = Complaint(
            id=next_id,
            title=title,
            description=description,
            category=category,
            priority=priority,
            student_id=user.id,
            issue_photo=issue_photo_filename or None,
            status='pending'
        )
        save_complaint(complaint)

        return jsonify({"message": "Complaint submitted.", "complaint": complaint.to_dict()}), 201

    status_filter = sanitize_text(request.args.get('status'))
    category_filter = sanitize_text(request.args.get('category'))

    filter_query = {}
    if user.role == 'student':
        filter_query["student_id"] = user.id
    else:
        if status_filter:
            if status_filter not in VALID_STATUSES:
                return error_response("Invalid status filter.", 422)
            filter_query["status"] = status_filter
        if category_filter:
            if category_filter not in VALID_CATEGORIES:
                return error_response("Invalid category filter.", 422)
            filter_query["category"] = category_filter

    complaints_cursor = mongo_db.complaints.find(filter_query).sort("created_at", -1)
    complaints = [Complaint.from_dict(doc) for doc in complaints_cursor]
    response = {
        "complaints": [complaint.to_dict() for complaint in complaints],
        "stats": build_stats(complaints),
    }

    if user.role == 'warden':
        categories = mongo_db.complaints.distinct("category")
        all_complaints_cursor = mongo_db.complaints.find()
        all_complaints = [Complaint.from_dict(doc) for doc in all_complaints_cursor]
        global_stats = build_stats(all_complaints)
        response["categories"] = categories
        response["globalStats"] = global_stats

    return jsonify(response)


@app.route('/api/complaints/<int:complaint_id>', methods=['GET', 'PUT'])
def complaint_detail(complaint_id: int):
    user = current_user()
    if not user:
        return error_response("Authentication required.", 401)

    complaint_doc = mongo_db.complaints.find_one({"_id": complaint_id})
    if not complaint_doc:
        return error_response("Complaint not found.", 404)

    complaint = Complaint.from_dict(complaint_doc)

    if request.method == 'GET':
        if user.role != 'warden' and complaint.student_id != user.id:
            return error_response("You do not have permission to view this complaint.", 403)
        return jsonify({"complaint": complaint.to_dict()})

    if user.role != 'warden':
        return error_response("Only wardens can update complaints.", 403)

    data = extract_request_data()
    status = sanitize_text(data.get('status'))
    warden_notes = data.get('warden_notes')

    if status:
        if status not in VALID_STATUSES:
            return error_response("Invalid status value.", 422)
        complaint.status = status

    if warden_notes is not None:
        complaint.warden_notes = sanitize_text(warden_notes)

    resolution_photo_file = request.files.get('resolution_photo')
    if resolution_photo_file:
        try:
            complaint.resolution_photo = save_uploaded_file(resolution_photo_file, f"resolution_{complaint.id}")
        except ValueError as exc:
            return error_response(str(exc))

    complaint.updated_at = datetime.utcnow()
    save_complaint(complaint)

    return jsonify({"message": "Complaint updated.", "complaint": complaint.to_dict()})


if __name__ == '__main__':
    # Create indexes for unique constraints
    mongo_db.users.create_index("username", unique=True)
    mongo_db.users.create_index("email", unique=True)
    mongo_db.password_resets.create_index("token", unique=True)

    # Seed warden account if it doesn't exist
    if not mongo_db.users.find_one({"username": "warden123"}):
        next_id = get_next_sequence_value("users")
        warden = User(
            id=next_id,
            username='warden123',
            email='warden123@hostel.com',
            role='warden',
            password_hash=''
        )
        warden.set_password('warden123')
        save_user(warden)
        print("Default warden account created.")

    app.run(debug=True)


