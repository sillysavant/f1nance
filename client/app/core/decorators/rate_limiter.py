import time
from functools import wraps
from fastapi import HTTPException, status, Depends
from app.core.redis import redis_client
from app.api.dependencies.auth import get_current_user


def rate_limit(limit_seconds: int = 60, prefix: str = "rate_limit"):
    """
    Decorator for per-user rate limiting using Redis.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            key = f"{prefix}:{current_user.id}"
            if redis_client.exists(key):
                remaining = redis_client.ttl(key)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Try again in {remaining} seconds.",
                )
            redis_client.setex(key, limit_seconds, int(time.time()))
            return func(*args, current_user=current_user, **kwargs)

        return wrapper

    return decorator
