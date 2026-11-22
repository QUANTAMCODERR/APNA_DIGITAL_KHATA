
from datetime import datetime
from zoneinfo import ZoneInfo

from app.core.database import AsyncSessionLocal
from app.services.reminder import generate_payment_reminders


async def main():
    timezone = ZoneInfo("Asia/Kolkata")
    as_of = datetime.now(timezone)

    async with AsyncSessionLocal() as db:
        reminders_created = await generate_payment_reminders(
            db=db,
            as_of=as_of
        )

    print(f"Reminder job completed.")
    print(f"Date: {as_of.date()}")
    print(f"New reminders created: {reminders_created}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
