import mysql.connector
from mysql.connector import Error
from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS
from flask_restx import Api, Resource
from pdf2image import convert_from_path
import time
from flasgger import Swagger
import hashlib
import json

SECRET_PEPER = "OurLibKey"

app = Flask(__name__, static_folder='.')
swagger = Swagger(app)
CORS(app)

# DATABASE SECTION

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'BookLibraryForUniversity'
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

# @app.route('/uploads/PngBooks/<path:filename>')
# def serve_image(filename):
#     return send_from_directory('uploads/PngBooks', filename)

@app.route('/')
def index():
    return send_from_directory('.', 'catalog.html')

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
    description = request.form["description"]
    year = request.form["year"]
    groups = request.form["groups"]

    
    filename = f"{bookId}.pdf"
    clearNamePdf = cleanerFromPdf(filename)
    filePath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filePath)

    formated_groups = json.dumps(groups.split())
    maxPage = saveJpegsFromPdf(filename, clearNamePdf)
    DbLink = f"/uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_0.jpg"

    conn = get_db_connection()
    cursor = conn.cursor()
    use_DB = 'USE BookLibraryForUniversity;'
    query_insert_book_toDb = 'insert into Books (title, autor, book_description, link, book_year, last_page, arr_groups) values (%s, %s, %s, %s, %s, %s, %s)'
    params = (clearNamePdf, autor, description,  DbLink, year, f"{maxPage}", formated_groups)
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
    group = request.form["group"]
    role = request.form["role"]

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_books_by_index_student = 'select id, title, autor, book_year, link from BookLibraryForUniversity.Books where id > %s and id < %s and JSON_CONTAINS(arr_groups, %s);'
    parse_books_by_index_teacher = 'select id, title, autor, book_year, link from BookLibraryForUniversity.Books where id > %s and id < %s;'
    params_for_student = (start_index, end_index, json.dumps(group))
    params_for_teacher = (start_index, end_index, json.dumps(group))

    if role == "student":
        cursor.execute(parse_books_by_index_student, params_for_student)
    else:
        cursor.execute(parse_books_by_index_teacher, params_for_teacher)
    
    bookList = '@'.join([','.join([str(x) if x is not None else "" for x in t]) for t in cursor.fetchall()])

    cursor.close()
    conn.close()

    print(bookList)
    print('#2' * 20)

    return jsonify({"BookList": bookList})

@app.route('/request_book_info', methods=['POST'])
def request_book_info():
    print('\n-------request_book_info-----------\n')
    book_id = int(request.form["book_id"])

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'select title, autor, link, last_page from BookLibraryForUniversity.Books where id = %s;'
    params = (book_id,)
    cursor.execute(parse_book_info, params)
    
    booInfo = cursor.fetchall()[0]

    cursor.close()
    conn.close()

    print('#7' * 20)

    return jsonify({"title": booInfo[0], "autor": booInfo[1], "link": booInfo[2], "last_page": booInfo[3]})

@app.route('/request_login', methods=['POST'])
def request_request_login():
    print('\n-------request_login-----------\n')
    mail = request.form["mail"]
    password = request.form["password"]
    hash_password = hashlib.sha256((password + SECRET_PEPER).encode()).hexdigest()

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'SELECT user_name, mail, university_group, user_password, university_role FROM BookLibraryForUniversity.Users where mail = %s;'
    params = (mail,)
    cursor.execute(parse_book_info, params)
    
    results = cursor.fetchall()
    if not results:
        return jsonify({"result": "mail or password incorrect"})
    userInfo = results[0]

    # userInfo = cursor.fetchall()[0]
    if userInfo[3] != hash_password:
        return jsonify({"result": "mail or password incorrect"})

    
    
    print(userInfo[0])
    cursor.close()
    conn.close()

    print('#8' * 20)

    return jsonify({"name": userInfo[0], "mail": userInfo[1], "group": userInfo[2], "role": userInfo[4], "result": "success"})

@app.route('/request_register', methods=['POST'])
def request_request_register():
    print('\n-------request_register-----------\n')
    mail = request.form["mail"]
    password = request.form["password"]
    fullName = request.form["fullName"]
    role = request.form["role"]
    group = request.form["group"]

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'insert into BookLibraryForUniversity.Users (user_name, mail, user_password, university_group, university_subgroup, university_role) values ( %s, %s, %s, %s, %s, %s);'
    hash_password = hashlib.sha256((password + SECRET_PEPER).encode()).hexdigest()
    params = (fullName, mail, hash_password, group, "2", role)
    cursor.execute(parse_book_info, params)
    conn.commit()

    cursor.close()
    conn.close()

    print('#9' * 20)

    return jsonify({"result": "success"})


# uploads/PngBooks
def saveJpegsFromPdf(namePdf, clearNamePdf):
    pages = convert_from_path(f'uploads/{namePdf}', 150 ) #, poppler_path=r"D:\poppler\Library\bin")
    os.makedirs(f'uploads/PngBooks/Directory-{clearNamePdf}', exist_ok=True)
    maxPage = 0

    for count, page in enumerate(pages):
        maxPage += 1
        page.save(f'uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_{count}.jpg', 'JPEG')

    return maxPage


if __name__ == '__main__':
    if not os.path.exists('uploads/PngBooks'):
        os.mkdir('uploads/PngBooks')
    print(f"\n\nrun in browser by url earler ^ --\n\n")
    app.run(host='127.0.0.1', port=8080)




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