#!/usr/bin/env python3
"""
Script to view the database contents in a readable format (MongoDB version).
"""

import os
from datetime import datetime
from pymongo import MongoClient

def print_separator():
    print("=" * 80)

def print_table_header(title):
    print_separator()
    print(f"  {title}")
    print_separator()

def view_database():
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/hostel_portal')
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()

    # Get all users
    users = list(db.users.find())
    print_table_header("USERS TABLE")
    if not users:
        print("  No users found.")
    else:
        print(f"  Total Users: {len(users)}\n")
        for user in users:
            print(f"  ID: {user['_id']}")
            print(f"  Username: {user['username']}")
            print(f"  Email: {user['email']}")
            print(f"  Role: {user['role']}")
            print(f"  Room Number: {user.get('room_number') or 'N/A'}")
            print(f"  Profile Photo: {user.get('profile_photo') or 'None'}")
            print(f"  Created At: {user.get('created_at')}")
            print()
    
    # Get all complaints
    complaints = list(db.complaints.find())
    print_table_header("COMPLAINTS TABLE")
    if not complaints:
        print("  No complaints found.")
    else:
        print(f"  Total Complaints: {len(complaints)}\n")
        for complaint in complaints:
            # Get student username
            student_doc = db.users.find_one({"_id": complaint['student_id']})
            student_name = student_doc['username'] if student_doc else 'N/A'
            
            print(f"  ID: {complaint['_id']}")
            print(f"  Title: {complaint['title']}")
            desc = complaint['description']
            print(f"  Description: {desc[:100]}..." if len(desc) > 100 else f"  Description: {desc}")
            print(f"  Category: {complaint['category']}")
            print(f"  Priority: {complaint.get('priority', 'medium')}")
            print(f"  Status: {complaint.get('status', 'pending')}")
            print(f"  Student ID: {complaint['student_id']}")
            print(f"  Student: {student_name}")
            print(f"  Warden Notes: {complaint.get('warden_notes') or 'None'}")
            print(f"  Issue Photo: {complaint.get('issue_photo') or 'None'}")
            print(f"  Resolution Photo: {complaint.get('resolution_photo') or 'None'}")
            print(f"  Created At: {complaint.get('created_at')}")
            print(f"  Updated At: {complaint.get('updated_at')}")
            print()
    
    # Get all password resets
    password_resets = list(db.password_resets.find())
    print_table_header("PASSWORD_RESET TABLE")
    if not password_resets:
        print("  No password reset records found.")
    else:
        print(f"  Total Password Reset Records: {len(password_resets)}\n")
        for pr in password_resets:
            # Get user username
            user_doc = db.users.find_one({"_id": pr['user_id']})
            user_name = user_doc['username'] if user_doc else 'N/A'
            
            # Check validity
            is_valid = not pr.get('used', False) and datetime.utcnow() < pr['expires_at']
            
            print(f"  ID: {pr['_id']}")
            print(f"  User ID: {pr['user_id']}")
            print(f"  User: {user_name}")
            print(f"  Token: {pr['token'][:20]}..." if len(pr['token']) > 20 else f"  Token: {pr['token']}")
            print(f"  Created At: {pr.get('created_at')}")
            print(f"  Expires At: {pr.get('expires_at')}")
            print(f"  Used: {pr.get('used', False)}")
            print(f"  Valid: {is_valid}")
            print()
    
    # Summary statistics
    print_table_header("DATABASE SUMMARY")
    print(f"  Total Users: {len(users)}")
    print(f"    - Students: {len([u for u in users if u['role'] == 'student'])}")
    print(f"    - Wardens: {len([u for u in users if u['role'] == 'warden'])}")
    print(f"  Total Complaints: {len(complaints)}")
    if complaints:
        status_counts = {}
        for c in complaints:
            status = c.get('status', 'pending')
            status_counts[status] = status_counts.get(status, 0) + 1
        print(f"    - By Status:")
        for status, count in status_counts.items():
            print(f"      * {status}: {count}")
    print(f"  Total Password Reset Records: {len(password_resets)}")
    print_separator()

if __name__ == '__main__':
    view_database()
