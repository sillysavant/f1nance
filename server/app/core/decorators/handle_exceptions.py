import traceback
import asyncio
import inspect
from functools import wraps
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette import status
from pydantic import ValidationError


def handle_exceptions(func):
    """
    Decorator to catch and standardize unhandled exceptions
    into JSON responses across routes and services.
    """
    is_coroutine = asyncio.iscoroutinefunction(func)

    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            if is_coroutine:
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            return result
        except HTTPException:
            raise  # Let FastAPI handle HTTP exceptions
        except ValidationError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(e)
            )
        except Exception as e:
            # Capture unexpected errors
            error_trace = traceback.format_exc()
            print(f"[ERROR] {func.__name__}: {str(e)}\n{error_trace}")

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": {
                        "type": e.__class__.__name__,
                        "message": str(e)
                    }
                }
            )

    # Update the signature to match the original function
    sig = inspect.signature(func)
    wrapper.__signature__ = sig
    
    return wrapper