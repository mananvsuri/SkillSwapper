#!/usr/bin/env python3
"""
Script to add test users Maina and Dhaval
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import User, Skill
from app.core.security import get_password_hash
from datetime import datetime

def add_test_users():
    """Add test users Maina and Dhaval"""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        maina = db.query(User).filter(User.email == "maina@gmail.com").first()
        dhaval = db.query(User).filter(User.email == "dhaval@gmail.com").first()
        
        if not maina:
            print("Creating Maina user...")
            maina = User(
                name="Maina",
                email="maina@gmail.com",
                password_hash=get_password_hash("Maina@1234"),
                location="Mumbai, India",
                is_admin=False,
                is_banned=False,
                is_public=True,
                availability="Weekends",
                created_at=datetime.now()
            )
            db.add(maina)
            db.commit()
            db.refresh(maina)
            
            # Add some skills for Maina
            maina_skills = [
                Skill(name="Cooking", type="offered", level="intermediate", user_id=maina.id, status="approved"),
                Skill(name="Photography", type="offered", level="beginner", user_id=maina.id, status="approved"),
                Skill(name="Guitar", type="wanted", level="beginner", user_id=maina.id, status="approved"),
                Skill(name="Spanish", type="wanted", level="intermediate", user_id=maina.id, status="approved")
            ]
            for skill in maina_skills:
                db.add(skill)
            
            print("✅ Maina user created successfully!")
            print("Email: maina@gmail.com")
            print("Password: Maina@1234")
        
        if not dhaval:
            print("Creating Dhaval user...")
            dhaval = User(
                name="Dhaval",
                email="dhaval@gmail.com",
                password_hash=get_password_hash("Dhaval@1234"),
                location="Delhi, India",
                is_admin=False,
                is_banned=False,
                is_public=True,
                availability="Evenings",
                created_at=datetime.now()
            )
            db.add(dhaval)
            db.commit()
            db.refresh(dhaval)
            
            # Add some skills for Dhaval
            dhaval_skills = [
                Skill(name="Programming", type="offered", level="advanced", user_id=dhaval.id, status="approved"),
                Skill(name="Guitar", type="offered", level="intermediate", user_id=dhaval.id, status="approved"),
                Skill(name="Spanish", type="offered", level="beginner", user_id=dhaval.id, status="approved"),
                Skill(name="Cooking", type="wanted", level="beginner", user_id=dhaval.id, status="approved"),
                Skill(name="Photography", type="wanted", level="intermediate", user_id=dhaval.id, status="approved")
            ]
            for skill in dhaval_skills:
                db.add(skill)
            
            print("✅ Dhaval user created successfully!")
            print("Email: dhaval@gmail.com")
            print("Password: Dhaval@1234")
        
        db.commit()
        print("✅ Test users setup completed!")
        
        # Print user count
        total_users = db.query(User).count()
        print(f"Total users in database: {total_users}")
        
    except Exception as e:
        print(f"❌ Error adding test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_users() 