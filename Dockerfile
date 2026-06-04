FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    poppler-utils \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Копируем всё приложение
COPY . .

# Создаём папки
RUN mkdir -p uploads uploads/PngBooks covers static && chmod -R 777 uploads covers static

# Создаем непривилегированного пользователя
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Рабочая директория - корень приложения (где лежит server.py)
WORKDIR /app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Запускаем server.py напрямую
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server:app", "--workers", "3"]
