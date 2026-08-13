import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = 'SUPER_ADMIN'
    NAZIM = 'NAZIM'
    USTAD = 'USTAD'
    STUDENT = 'STUDENT'
    PARENT = 'PARENT'

class CenterStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    SUSPENDED = 'SUSPENDED'

class RelationType(str, enum.Enum):
    FATHER = 'FATHER'
    MOTHER = 'MOTHER'
    GUARDIAN = 'GUARDIAN'

class MasteryLevel(str, enum.Enum):
    EXCELLENT = 'EXCELLENT'
    GOOD = 'GOOD'
    NEEDS_WORK = 'NEEDS_WORK'
    FAIL = 'FAIL'

class JamaatStatus(str, enum.Enum):
    PRESENT_IN_JAMAAT = 'PRESENT_IN_JAMAAT'
    LATE = 'LATE'
    PRAYED_ALONE = 'PRAYED_ALONE'
    MISSED = 'MISSED'
    EXCUSED = 'EXCUSED'
