# ScanManager
**Умное хранилище сканов:** OCR, поиск, фильтрация, склейка страниц и AI-поддержка.

## Стек технологий

- **Backend:** FastAPI  
- **Frontend:** React + TypeScript + Vite  
- **База данных:** PostgreSQL  
- **OCR:** Tesseract  
- **AI:** Ollama (локальная LLM)

---

## Запуск проекта

### Клонирование репозитория:
  ```bash
    git clone https://github.com/dayerzz/ScanManager.git
    cd ScanManager
  ```


### Установка Tesseract_OCR

#### Windows:
1. Скачать установщик: https://github.com/UB-Mannheim/tesseract/wiki
2. Установка (запомнить путь при установки)

---

### Backend

1. Перейти в папку `backend`:
   ```bash
   cd backend
   ```
2. Создать виртуальное окружение:
   ```bash
   python -m venv venv
   ```
3. Активировать окружение:
   ```bash
   # Windows
   .\venv\Scripts\activate

   # Linux/macOS
   source venv/bin/activate
4. Установить зависимости:
   ```bash
   pip install -r requirements.txt
   ```
5. Создать файл .env в корне проекта со следующим содержимым:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/scanmanager_db
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   TESSERACT_CMD=ваш_путь_к_Tesseract
   ```
6. Запустить сервер:
   ```bash
   uvicorn app.main:app --reload
   ```
   Backend будет доступен по адресу: http://localhost:8000

---
   
### Frontend

1. Перейти в папку frontend:
   ```bash
   cd frontend
   ```
2. Установить зависимости:
   ```bash
   npm install
   ```
3. Запустить приложение:
   ```bash
   npm run dev
   ```
---

### AI-поддержка (Ollama)

1. Установить Ollama с официального сайта: https://ollama.com
2. Скачать модель (например, mistral) через консоль:
   ```bash
   ollama run mistral
   ```
   После загрузки (~5 ГБ) локальная модель будет доступна по адресу: http://localhost:11434. Чат в приложении начнёт работать автоматически.

---

### ВНИМАНИЕ: проект всё ещё в разработке
