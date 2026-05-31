FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    poppler-utils \
 && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY requirements.txt ./
RUN if [ -f requirements.txt ]; then \
        pip install --no-cache-dir -r requirements.txt; \
    else \
        pip install --no-cache-dir flask flask-cors flask-restx flasgger mysql-connector-python pdf2image; \
    fi

# Копируем всё приложение
COPY . .

# Создаём папки для загрузок и статики
RUN mkdir -p uploads uploads/PngBooks covers static && chmod -R 777 uploads covers static

EXPOSE 5000

CMD ["python", "server.py"]