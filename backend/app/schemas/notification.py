
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.notification import (
    NotificationType,
    NotificationStatus
)


class NotificationResponse(BaseModel):
    id: UUID
    customer_id: UUID
    transaction_id: UUID | None
    notification_type: NotificationType
    message: str
    status: NotificationStatus
    sent_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
