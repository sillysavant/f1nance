import time
from fastapi import HTTPException, status, Request, Depends
from app.core.redis import redis_client

def rate_limit(limit_seconds: int = 60, prefix: str = "rate_limit"):
    """
    Rate limiting dependency using Redis.
    """
    async def rate_limit_dependency(request: Request):
        client_ip = request.client.host
        key = f"{prefix}:{client_ip}"
        
        if redis_client.exists(key):
            remaining = redis_client.ttl(key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Try again in {remaining} seconds.",
            )
            
        redis_client.setex(key, limit_seconds, int(time.time()))
        return True

    def decorator(func):
        # Add the rate limit dependency to the route
        dependency = Depends(rate_limit_dependency)
        if hasattr(func, "dependencies"):
            func.dependencies.append(dependency)
        else:
            func.dependencies = [dependency]
        return func

    return decorator
