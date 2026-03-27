FROM node:20-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Copy React build to Django static
RUN mkdir -p /app/staticfiles/frontend
COPY --from=frontend-build /app/frontend/dist/ /app/staticfiles/frontend/

RUN python manage.py collectstatic --noinput 2>/dev/null || true

CMD python manage.py migrate --noinput 2>/dev/null; gunicorn recipe_finder.wsgi --bind 0.0.0.0:${PORT} --timeout 120
