import traceback
from functools import wraps
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from starlette import status


def handle_exceptions(func):
    """
    Decorator to catch and standardize unhandled exceptions
    into JSON responses across routes and services.
    """

    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except HTTPException as e:
            # Let FastAPI handle expected HTTP errors
            raise e
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
                        "message": str(e),
                    },
                },
            )

    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except HTTPException as e:
            raise e
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[ERROR] {func.__name__}: {str(e)}\n{error_trace}")

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": {
                        "type": e.__class__.__name__,
                        "message": str(e),
                    },
                },
            )

    # Detect if the function is async or sync
    if func.__code__.co_flags & 0x80:  # CO_COROUTINE
        return async_wrapper
    else:
        return sync_wrapper
