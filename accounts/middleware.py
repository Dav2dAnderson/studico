import logging
import time

logger = logging.getLogger("api")

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()

        response = self.get_response(request)

        duration_ms = (time.monotonic() - start) * 1000
        user = getattr(request, "user", None)
        user_str = str(user) if user and user.is_authenticated else "anonymous"

        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            "%s %s -> %d | user=%s | %.1fms",
            request.method,
            request.get_full_path(),
            response.status_code,
            user_str,
            duration_ms,
        )

        return response