import mysql.connector
from mysql.connector import Error
from flask import Flask, request, jsonify, send_from_directory, send_file
import os
from flask_cors import CORS
from flask_restx import Api, Resource
from pdf2image import convert_from_path
import time
from flasgger import Swagger
from werkzeug.utils import secure_filename


app = Flask(__name__, static_folder='.')
swagger = Swagger(app)
CORS(app)

# DATABASE SECTION
# Конфигурация БД из переменных окружения (для Docker)
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', '220103гш'),
    'database': os.environ.get('DB_NAME', 'BookLibraryForUniversity')
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Ошибка подключения: {e}")
        return None





# END DATABASE SECTION

def cleanerFromPdf(name):
    newName = name.replace('pdf', '')
    newName = newName.replace('.', '')
    return newName
# Папка для сохранения PDF
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Разрешенные расширения
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/admin/books/<int:book_id>/cover', methods=['POST'])
def upload_cover(book_id):
    """Загрузка обложки в папку с книгой"""
    
    # Получаем название книги из БД
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM Books WHERE id = %s", (book_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not result:
        return jsonify({"error": "Book not found"}), 404
    
    book_title = result[0]
    clean_title = book_title.replace(' ', '_')  # "Test book" -> "Test_book"
    
    # Проверяем файл
    if 'cover' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['cover']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Разрешенные расширения
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    ext = file.filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_extensions:
        return jsonify({"error": "File type not allowed"}), 400
    
    # СОЗДАЁМ ПАПКУ ДЛЯ КНИГИ (правильный путь)
    book_dir = os.path.join('uploads', 'PngBooks', f'Directory-{clean_title}')
    os.makedirs(book_dir, exist_ok=True)
    
    # Сохраняем файл
    filename = f"{clean_title}_0.{ext}"
    filepath = os.path.join(book_dir, filename)
    file.save(filepath)
    
    # URL для БД
    cover_url = f"/uploads/PngBooks/Directory-{clean_title}/{filename}"
    
    # Обновляем БД
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE Books SET cover_url = %s WHERE id = %s", (cover_url, book_id))
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({
        "status": "success",
        "message": f"Cover uploaded for book {book_id}",
        "cover_url": cover_url
    }), 200

@app.route('/api/admin/books/import-covers', methods=['POST'])
def import_covers():
    """Массовый импорт обложек (записывает URL в БД)"""
    data = request.get_json()
    
    if not data or 'covers' not in data:
        return jsonify({"error": "Invalid data. Expected { 'covers': {book_id: cover_url} }"}), 400
    
    covers_data = data['covers']
    updated_count = 0
    errors = []
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    for book_id, cover_url in covers_data.items():
        try:
            cursor.execute("UPDATE Books SET cover_url = %s WHERE id = %s", (cover_url, int(book_id)))
            conn.commit()
            updated_count += cursor.rowcount
        except Error as e:
            errors.append(f"Book {book_id}: {str(e)}")
    
    cursor.close()
    conn.close()
    
    return jsonify({
        "status": "success",
        "updated_count": updated_count,
        "errors": errors
    }), 200

# @app.route('/uploads/PngBooks/<path:filename>')
# def serve_image(filename):
#     return send_from_directory('uploads/PngBooks', filename)

@app.route('/')
def index():
    return send_from_directory('.', 'html.html')

# @app.route('/catalog.html')
# def catalog_html():
#     return send_from_directory('.', 'catalog.html')

# @app.route('/reader.html')
# def reader_html():
#     return send_from_directory('.', 'reader.html')

# @app.route('/mainPage')
# def mainPage():
#     return send_from_directory('.', 'index1.html')

# @app.route('/index.js')
# def serve_js():
#     return send_from_directory('.', 'index.js')

# @app.route('/js/main.js')
# def main_js():
#     return send_from_directory('.', 'js/main.js')

# @app.route('/js/reader.js')
# def reader_js():
#     return send_from_directory('.', 'js/reader.js')

# @app.route('/js/catalog.js')
# def catalog_js():
#     return send_from_directory('.', 'js/catalog.js')

# @app.route('/js/auth.js')
# def auth_js():
#     return send_from_directory('.', 'js/auth.js')

# @app.route('/js/profile.js')
# def profile_js():
#     return send_from_directory('.', 'js/profile.js')

# @app.route('/js/initListenner.js')
# def initListenner_js():
#     return send_from_directory('.', 'js/initListenner.js')

# @app.route('/index.css')
# def serve_css():
#     return send_from_directory('.', 'index.css')

# @app.route('/css/style.css')
# def style_css():
#     return send_from_directory('.', 'css/style.css')

# @app.route('/css/catalog.css')
# def catalog_css():
#     return send_from_directory('.', 'css/catalog.css')

# @app.route('/components/footer.html')
# def footer_html():
#     return send_from_directory('.', 'components/footer.html')

# @app.route('/components/header.html')
# def header_html():
#     return send_from_directory('.', 'components/header.html')

# @app.route('/login.html')
# def login_html():
#     return send_from_directory('.', 'login.html')

# @app.route('/profile.html')
# def profile_html():
#     return send_from_directory('.', 'profile.html')

# /uploads/PngBooks
@app.route('/uploads/PngBooks/<path:filename>')
def serve_pngBooks(filename):
    return send_from_directory('uploads/PngBooks', filename)

# Универсальный для JS
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

# Универсальный для CSS
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

# Универсальный для картинок
@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

# Универсальный для загрузок
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory('uploads', filename)

# Универсальный для ВСЕХ HTML (если не нужны красивые URL)
@app.route('/<path:filename>')
def serve_all_html(filename):
    if filename.endswith('.html'):
        return send_from_directory('.', filename)
    return "Page not found", 404

    
# /uploads/PngBooks/Directory-Presentation/Presentation_2.jpg
@app.route('/upload_pdf', methods=['POST'])
def uploadPdf():
    file = request.files["pdf"]
    bookId = request.form["book_id"]
    autor = request.form["autor"] # autor

    host_url = request.host_url.rstrip('/')
    
    filename = f"{bookId}.pdf"
    clearNamePdf = cleanerFromPdf(filename)
    filePath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filePath)
    
    maxPage = saveJpegsFromPdf(filename, clearNamePdf)

    DbLink = f"/uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_0.jpg"

    conn = get_db_connection()
    cursor = conn.cursor()
    use_DB = 'USE BookLibraryForUniversity;'
    query_insert_book_toDb = 'insert into Books (title, autor, book_description, link, last_page) values (%s, %s, %s, %s, %s);'
    params = (clearNamePdf, autor, "description", DbLink, f"{maxPage}")
    cursor.execute(use_DB)
    cursor.execute(query_insert_book_toDb, params)
    conn.commit()
    cursor.close()
    conn.close()
                                

    if os.path.exists(filePath):
        os.remove(filePath)
        print(f"{filePath} - deleted")

    return jsonify({"status": "ok", "maxPage": f"{maxPage}", "message": f"Книга {bookId} загружена", "link": f"{DbLink}"})


@app.route('/request_books', methods=['POST'])
def request_books():
    print('request_books' * 20)
    start_index = int(request.form["start_index"])
    end_index = int(request.form["end_index"])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_books_by_index = 'SELECT id, title, autor, book_year, link, cover_url FROM Books WHERE id > %s AND id < %s;'
    params = (start_index, end_index)
    cursor.execute(parse_books_by_index, params)
    
    books = []
    for row in cursor.fetchall():
        id_, title, autor, book_year, link, cover_url = row
        # Важно: НЕ заменяем на плейсхолдер здесь!
        # Отдаём реальный cover_url (даже если NULL)
        books.append([id_, title, autor, book_year, link, cover_url if cover_url else ''])
    
    cursor.close()
    conn.close()
    
    bookList = '@'.join([','.join([str(x) if x is not None else "" for x in book]) for book in books])
    
    return jsonify({"BookList": bookList})

@app.route('/request_book_info', methods=['POST'])
def request_book_info():
    print('\n-------request_book_info-----------\n')
    book_id = int(request.form["book_id"])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'select title, autor, link, last_page, cover_url from Books where id = %s;'
    params = (book_id,)
    cursor.execute(parse_book_info, params)
    
    booInfo = cursor.fetchall()[0]  # <- здесь переменная называется booInfo
    
    cursor.close()
    conn.close()
    
    print('#7' * 20)
    
    # Исправлено: booInfo вместо bookInfo
    cover_url = booInfo[4] if booInfo[4] and booInfo[4] != '' else "/static/placeholder.png"
    
    return jsonify({
        "title": booInfo[0],
        "autor": booInfo[1],
        "link": booInfo[2],
        "last_page": booInfo[3],
        "cover_url": cover_url
    })

@app.route('/static/placeholder.png')
def serve_placeholder():
    return send_from_directory('static', 'placeholder.png')

@app.route('/request_login', methods=['POST'])
def request_request_login():
    print('\n-------request_login-----------\n')
    mail = request.form["mail"]
    password = request.form["password"]

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'SELECT user_name, mail, university_group, user_password FROM BookLibraryForUniversity.Users where mail = %s;'
    params = (mail,)
    cursor.execute(parse_book_info, params)
    
    userInfo = cursor.fetchall()[0]
    if userInfo[3] != password:
        return jsonify({"result": "mail or password incorrect"})
    
    print(userInfo[0])
    cursor.close()
    conn.close()

    print('#8' * 20)

    return jsonify({"name": userInfo[0], "mail": userInfo[1], "group": userInfo[2], "result": "success"})

@app.route('/request_register', methods=['POST'])
def request_request_register():
    print('\n-------request_register-----------\n')
    mail = request.form["mail"]
    password = request.form["password"]
    fullName = request.form["fullName"]

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'insert into BookLibraryForUniversity.Users (user_name, mail, user_password, university_group, university_subgroup, university_role) values ( %s, %s, %s, %s, %s, %s);'
    params = (fullName, mail, password, "sameGroup", "2", "student")
    cursor.execute(parse_book_info, params)
    conn.commit()

    cursor.close()
    conn.close()

    print('#9' * 20)

    return jsonify({"result": "success"})


def saveJpegsFromPdf(namePdf, clearNamePdf):
    # В Docker poppler уже установлен в системе через apt-get install poppler-utils
    # Путь указывать не нужно - convert_from_path сам найдет poppler
    pages = convert_from_path(f'uploads/{namePdf}', 150)
    os.mkdir(f'uploads/PngBooks/Directory-{clearNamePdf}')
    maxPage = 0
    for count, page in enumerate(pages):
        maxPage += 1
        page.save(f'uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_{count}.jpg', 'JPEG')
    return maxPage


if __name__ == '__main__':
    if not os.path.exists('uploads/PngBooks'):
        os.mkdir('uploads/PngBooks')
    
    # Для Docker используем 0.0.0.0 и порт из переменных
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"\n\nСервер запущен на http://{host}:{port}\n\n")
    app.run(host=host, port=port, debug=debug)




# http://100.86.48.107:8080/parserMessages?a=5&b=6
# @app.route('/parserMessages', methods=['GET'])
# def parser_messages():
#     phone1 = request.args.get('a')
#     phone2 = request.args.get('b')
#     return jsonify({"a": phone1, "b": phone2})

# @app.route('/upload_pdf', methods=['POST'])
# def uploadPdf():
#     print("ЗАПРОС ПОЛУЧЕН!")  # Это должно появиться в консоли сервера
#     return jsonify({"test": "hello world"})
