# server/app/api/v1/routes/currency_tracing.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
from typing import List, Dict, Any

from app.api.dependencies.db import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User

router = APIRouter(prefix="/currency-tracing", tags=["Currency Tracing"])

# Example structure for records returned to frontend
def format_record(base: str, target: str, rate: float) -> Dict[str, Any]:
    return {
        "title": f"{base} to {target}",
        "description": f"Current rate: {rate}",
        "status": "traced",  # can be 'traced', 'warning', 'verified', etc.
        "date": datetime.utcnow(),
    }

@router.get("/", response_model=List[Dict[str, Any]])
async def get_currency_tracing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    base: str = "USD",
    targets: str = "EUR,KES,GBP"
):
    """
    Fetch real-time exchange rates for the given base currency
    and return records for frontend display.
    """
    target_list = [t.strip().upper() for t in targets.split(",")]

    # Call exchangerate.host API
    url = f"https://api.exchangerate.host/latest"
    params = {"base": base, "symbols": ",".join(target_list)}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch exchange rates: {e}")

    if "rates" not in data:
        raise HTTPException(status_code=502, detail="Invalid response from exchange rate API")

    # Build records dynamically
    records = [
        format_record(base, target, data["rates"].get(target, 0))
        for target in target_list
    ]

    return records
