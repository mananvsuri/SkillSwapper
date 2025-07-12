from app.db.session import engine
from app.models import base, user, skill, swap, rating, swapcoin

def init_db():
    base.Base.metadata.create_all(bind=engine)

# Optionally seed data:
# def seed_data():
#     db = SessionLocal()
#     # Add dummy users/skills here if needed
#     db.commit()
#     db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized ✅")
