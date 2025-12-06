from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# -------------------
# Base model
# -------------------
class SubscriptionBase(BaseModel):
    plan_name: str

# -------------------
# Creation model
# -------------------
class SubscriptionCreate(SubscriptionBase):
    pass  # user_id is removed; backend will attach current_user.id

# -------------------
# Update model
# -------------------
class SubscriptionUpdate(BaseModel):
    status: Optional[str]
    churned: Optional[bool]

# -------------------
# Output model
# -------------------
class SubscriptionOut(BaseModel):
    id: int
    user_id: int
    plan_name: str
    status: str
    mrr: float
    churned: bool
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        orm_mode = True
