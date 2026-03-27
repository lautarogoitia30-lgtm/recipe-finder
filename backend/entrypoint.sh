#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput 2>/dev/null || true

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn recipe_finder.wsgi --bind 0.0.0.0:${PORT:-8000} --timeout 120
