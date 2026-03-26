FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput 2>/dev/null || true

CMD python manage.py migrate --noinput && gunicorn recipe_finder.wsgi --bind 0.0.0.0:${PORT:-8000} --timeout 120
