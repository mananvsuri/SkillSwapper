#!/usr/bin/env python3
"""
Script to set up admin user and update database schema
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import User
from app.core.security import get_password_hash
from sqlalchemy import text

def setup_admin():
    """Set up admin user and update database schema"""
    db = SessionLocal()
    
    try:
        # Update database schema first - add new columns if they don't exist
        print("Updating database schema...")
        
        # Add new columns if they don't exist
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE"))
            print("Added is_banned column to users table")
        except Exception as e:
            print(f"is_banned column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Added created_at column to users table")
        except Exception as e:
            print(f"created_at column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL"))
            print("Added last_login column to users table")
        except Exception as e:
            print(f"last_login column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE skills ADD COLUMN status VARCHAR(20) DEFAULT 'approved'"))
            print("Added status column to skills table")
        except Exception as e:
            print(f"status column might already exist: {e}")
        
        try:
            db.execute(text("ALTER TABLE skills ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Added created_at column to skills table")
        except Exception as e:
            print(f"created_at column might already exist: {e}")
        
        # Create platform_messages table
        try:
            db.execute(text("""
                CREATE TABLE platform_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR NOT NULL,
                    message TEXT NOT NULL,
                    message_type VARCHAR DEFAULT 'info',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    is_active BOOLEAN DEFAULT TRUE
                )
            """))
            print("Created platform_messages table")
        except Exception as e:
            print(f"platform_messages table might already exist: {e}")
        
        db.commit()
        
        # Now check if admin user already exists
        try:
            admin_user = db.query(User).filter(User.email == "admin@gmail.com").first()
            
            if admin_user:
                print("Admin user already exists, updating admin privileges...")
                admin_user.is_admin = True
                admin_user.is_banned = False
            else:
                print("Creating admin user...")
                admin_user = User(
                    name="Admin",
                    email="admin@gmail.com",
                    password_hash=get_password_hash("Admin@1234"),
                    is_admin=True,
                    is_banned=False,
                    is_public=True
                )
                db.add(admin_user)
            
            db.commit()
            print("✅ Admin setup completed successfully!")
            print("Admin credentials:")
            print("Email: admin@gmail.com")
            print("Password: Admin@1234")
            
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            db.rollback()
        
    except Exception as e:
        print(f"❌ Error setting up admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_admin() 