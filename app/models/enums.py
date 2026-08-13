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
