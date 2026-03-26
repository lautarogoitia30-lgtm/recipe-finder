"""
Custom exception handler for DRF.
Strips internal details from error responses.
"""
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that:
    1. Logs full error details server-side
    2. Returns sanitized error messages to client
    3. Never exposes stack traces, Django version, or internal paths
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Log the full error for debugging (server-side only)
        view = context.get("view", None)
        view_name = view.__class__.__name__ if view else "Unknown"
        logger.warning(
            "API Error in %s: %s | Status: %s",
            view_name,
            str(exc),
            response.status_code,
        )

        # Sanitize the response for the client
        if response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            response.data = {
                "error": "An internal error occurred. Please try again later."
            }
        elif response.status_code == status.HTTP_400_BAD_REQUEST:
            # Keep validation errors but strip any internal details
            if isinstance(response.data, dict):
                clean_data = {}
                for key, value in response.data.items():
                    if isinstance(value, list):
                        clean_data[key] = [str(v) for v in value]
                    else:
                        clean_data[key] = str(value)
                response.data = {"errors": clean_data}

    return response
