# seed_db.py
import os
import bcrypt
from sqlalchemy import select

# Import database session and models
from app.database import SessionLocal, AsyncSessionLocal, engine, Base
from app.models.auth import Center, User
from app.models.enums import UserRole
from app.models.finance import FinanceCategory, FundCategory

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def seed_initial_data():
    print("Starting database bootstrap process...")
    Base.metadata.create_all(bind=engine)
    
    with SessionLocal() as db_session:
        # 1. Check if a Super Admin already exists to prevent duplicate seeds
        stmt = select(User).where(User.role == UserRole.SUPER_ADMIN.value)
        existing_admin = db_session.execute(stmt).scalar_one_or_none()
        
        if existing_admin:
            print(f"Super Admin '{existing_admin.email}' already exists. Skipping seed.")
            return

        # 2. Create the first operational Center (Masjid)
        first_center = Center(
            name="Masjid Umar - Main Branch",
            code="UMAR-001",
            address="Downtown District",
        )
        db_session.add(first_center)
        db_session.flush() # Flushes to DB to generate first_center.id without committing
        
        print(f"Created initial Center: {first_center.name} (ID: {first_center.id})")

        # 3. Create Default Finance Categories for the new Center
        zakat_category = FinanceCategory(
            center_id=first_center.id,
            name="General Zakat Fund",
            fund_type=FundCategory.ZAKAT.value
        )
        sadaqah_category = FinanceCategory(
            center_id=first_center.id,
            name="General Sadaqah",
            fund_type=FundCategory.SADAQAH.value
        )
        db_session.add_all([zakat_category, sadaqah_category])

        # 4. Create the Global Super Admin
        super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "admin@darscrm.com")
        super_admin_password = os.getenv("SUPER_ADMIN_PASSWORD", "SuperSecurePassword123!")
        
        super_admin = User(
            full_name="System Administrator",
            email=super_admin_email,
            phone="+12345678900",
            hashed_password=get_password_hash(super_admin_password),
            role=UserRole.SUPER_ADMIN.value,
            center_id=None, 
            is_active=True
        )
        db_session.add(super_admin)

        # 4b. Create Second Super Admin (superadmin@digidars.org)
        super_admin_2 = User(
            full_name="Global Super Admin",
            email="superadmin@digidars.org",
            phone="+12345678901",
            hashed_password=get_password_hash("SuperSecretPassword123"),
            role=UserRole.SUPER_ADMIN.value,
            center_id=None,
            is_active=True
        )
        db_session.add(super_admin_2)

        # 5. Create Center Admin (Nazim)
        nazim_user = User(
            full_name="Nazim Sb",
            email="admin@noor.org",
            phone="+12345678902",
            hashed_password=get_password_hash("AdminPassword123"),
            role=UserRole.NAZIM.value,
            center_id=first_center.id,
            is_active=True
        )
        db_session.add(nazim_user)

        # 6. Create Ustad User
        ustad_user = User(
            full_name="Ustad Ahmad",
            email="ustad@darscrm.com",
            phone="+12345678903",
            hashed_password=get_password_hash("UstadPassword123"),
            role=UserRole.USTAD.value,
            center_id=first_center.id,
            is_active=True
        )
        db_session.add(ustad_user)

        # 7. Commit all changes to the database safely
        db_session.commit()
        
        print("==================================================")
        print("Database successfully seeded with all roles!")
        print(f"Super Admin Email: {super_admin_email}")
        print("Nazim Email: admin@noor.org")
        print("Ustad Email: ustad@darscrm.com")
        print("==================================================")

if __name__ == "__main__":
    seed_initial_data()
