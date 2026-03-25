"""Seed test users into the database."""

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import get_session_factory
from app.models.enums import UserRole
from app.models.user import User

TEST_USERS = [
    {
        "email": "employee@operix.dev",
        "full_name": "Иван Сотрудников",
        "role": UserRole.EMPLOYEE,
        "password": "employee123",
    },
    {
        "email": "manager@operix.dev",
        "full_name": "Мария Управленцева",
        "role": UserRole.MANAGER,
        "password": "manager123",
    },
    {
        "email": "supplier@operix.dev",
        "full_name": "ООО Поставщик",
        "role": UserRole.SUPPLIER,
        "password": "supplier123",
    },
]


def seed() -> None:
    db = get_session_factory()()

    for entry in TEST_USERS:
        existing = db.scalar(select(User).where(User.email == entry["email"]))
        if existing:
            print(f"  Already exists: {entry['email']} ({entry['role'].value})")
            continue

        user = User(
            email=entry["email"],
            full_name=entry["full_name"],
            role=entry["role"],
            password_hash=hash_password(entry["password"]),
        )
        db.add(user)
        print(f"  Created: {entry['email']} / {entry['password']} ({entry['role'].value})")

    db.commit()
    db.close()
    print("Done!")


if __name__ == "__main__":
    seed()
