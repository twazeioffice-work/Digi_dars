import logging
from sqlalchemy.orm import Session
from app.models.auth import Center, User
from app.models.kitchen import CookProfile, MealSchedule
from app.models.enums import UserRole, CenterStatus
from app.core.security import get_password_hash

logger = logging.getLogger("dars_crm.seed")

def seed_database_if_empty(db: Session):
    center_count = db.query(Center).count()
    if center_count > 0:
        logger.info(f"Database already contains {center_count} centers. Skipping auto-seed.")
        return

    logger.info("Database is empty. Seeding initial centers, Super Admin, Nazims, Usthads, Students, and Cooks...")

    # 1. Create 2 Registered Centers
    center1 = Center(
        id="ctr_01_alnoor",
        name="Al-Noor Central Madrasa",
        code="CTR-01",
        address="Kollam Town Campus, Kerala",
        capacity=120,
        status=CenterStatus.ACTIVE.value
    )
    center2 = Center(
        id="ctr_02_ansarul",
        name="Ansarul Islam Hifz College",
        code="CTR-02",
        address="Kallambalam Junction Campus, Trivandrum",
        capacity=80,
        status=CenterStatus.ACTIVE.value
    )
    db.add_all([center1, center2])
    db.commit()

    hashed_pwd = get_password_hash("admin123")
    user_pwd = get_password_hash("password123")

    # 2. Super Admin User
    super_admin = User(
        id="usr_super_admin",
        center_id=None,
        role=UserRole.SUPER_ADMIN.value,
        full_name="Global Super Admin",
        email="superadmin@digidars.com",
        phone="+91 9900000000",
        hashed_password=hashed_pwd,
        is_active=True
    )
    db.add(super_admin)

    # 3. 2 Nazims (One for each center)
    nazim1 = User(
        id="usr_nazim_1",
        center_id=center1.id,
        role=UserRole.NAZIM.value,
        full_name="Nazim Faisal",
        email="faisal@alnoor.com",
        phone="+91 9847000001",
        hashed_password=user_pwd,
        is_active=True
    )
    nazim2 = User(
        id="usr_nazim_2",
        center_id=center2.id,
        role=UserRole.NAZIM.value,
        full_name="Nazim Basheer",
        email="basheer@ansarul.com",
        phone="+91 9847000002",
        hashed_password=user_pwd,
        is_active=True
    )
    db.add_all([nazim1, nazim2])

    # 4. 2 Usthads (One for each center)
    ustad1 = User(
        id="usr_ustad_1",
        center_id=center1.id,
        role=UserRole.USTAD.value,
        full_name="Usthad Ibrahim Kutty",
        email="ibrahim@alnoor.com",
        phone="+91 9847000003",
        hashed_password=user_pwd,
        is_active=True
    )
    ustad2 = User(
        id="usr_ustad_2",
        center_id=center2.id,
        role=UserRole.USTAD.value,
        full_name="Usthad Ahmad Koya",
        email="ahmad@ansarul.com",
        phone="+91 9847000004",
        hashed_password=user_pwd,
        is_active=True
    )
    db.add_all([ustad1, ustad2])

    # 5. 2 Students (One for each center)
    student1 = User(
        id="usr_student_1",
        center_id=center1.id,
        role=UserRole.STUDENT.value,
        full_name="Muhammad Bilal",
        email="bilal@alnoor.com",
        phone="+91 9847000005",
        hashed_password=user_pwd,
        is_active=True
    )
    student2 = User(
        id="usr_student_2",
        center_id=center2.id,
        role=UserRole.STUDENT.value,
        full_name="Zayd Ibn Harith",
        email="zayd@ansarul.com",
        phone="+91 9847000006",
        hashed_password=user_pwd,
        is_active=True
    )
    db.add_all([student1, student2])
    db.commit()

    # 6. 2 Cooks (One for each center)
    cook1 = CookProfile(
        id="cook_01",
        center_id=center1.id,
        name="Usman Cook (Al-Noor)",
        phone_number="+91 9847123456",
        is_active=True
    )
    cook2 = CookProfile(
        id="cook_02",
        center_id=center2.id,
        name="Kassim Cook (Ansarul)",
        phone_number="+91 9847654321",
        is_active=True
    )
    db.add_all([cook1, cook2])
    db.commit()

    logger.info("Successfully seeded database with 2 Centers, Super Admin, 2 Nazims, 2 Usthads, 2 Students, and 2 Cooks.")
