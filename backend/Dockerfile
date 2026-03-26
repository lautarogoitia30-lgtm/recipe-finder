FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Migrate and collectstatic at startup, not build
RUN echo '#!/bin/bash\n\
python manage.py migrate --noinput\n\
python manage.py collectstatic --noinput\n\
gunicorn recipe_finder.wsgi --bind 0.0.0.0:${PORT:-8000} --timeout 120\n\
' > start.sh && chmod +x start.sh

EXPOSE ${PORT}

CMD ["./start.sh"]
