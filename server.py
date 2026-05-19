import mysql.connector
from mysql.connector import Error
from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS
from flask_restx import Api, Resource
from pdf2image import convert_from_path
import time
from flasgger import Swagger


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

@app.route('/uploads/PngBooks/<path:filename>')
def serve_image(filename):
    return send_from_directory('uploads/PngBooks', filename)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/catalog.html')
def catalog_html():
    return send_from_directory('.', 'catalog.html')

@app.route('/reader.html')
def reader_html():
    return send_from_directory('.', 'reader.html')

@app.route('/mainPage')
def mainPage():
    return send_from_directory('.', 'index1.html')

@app.route('/index.js')
def serve_js():
    return send_from_directory('.', 'index.js')

@app.route('/js/main.js')
def main_js():
    return send_from_directory('.', 'js/main.js')

@app.route('/js/reader.js')
def reader_js():
    return send_from_directory('.', 'js/reader.js')

@app.route('/js/catalog.js')
def catalog_js():
    return send_from_directory('.', 'js/catalog.js')

@app.route('/js/profile.js')
def profile_js():
    return send_from_directory('.', 'js/profile.js')

@app.route('/js/initListenner.js')
def initListenner_js():
    return send_from_directory('.', 'js/initListenner.js')

@app.route('/index.css')
def serve_css():
    return send_from_directory('.', 'index.css')

@app.route('/css/style.css')
def style_css():
    return send_from_directory('.', 'css/style.css')

@app.route('/components/footer.html')
def footer_html():
    return send_from_directory('.', 'components/footer.html')

@app.route('/components/header.html')
def header_html():
    return send_from_directory('.', 'components/header.html')

@app.route('/login.html')
def login_html():
    return send_from_directory('.', 'login.html')

@app.route('/profile.html')
def profile_html():
    return send_from_directory('.', 'profile.html')
    
# /uploads/PngBooks/Directory-Presentation/Presentation_2.jpg
@app.route('/upload_pdf', methods=['POST'])
def uploadPdf():
    file = request.files["pdf"]
    bookId = request.form["book_id"]

    host_url = request.host_url.rstrip('/')
    
    filename = f"{bookId}.pdf"
    clearNamePdf = cleanerFromPdf(filename)
    filePath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filePath)
    
    maxPage = saveJpegsFromPdf(filename, clearNamePdf)

    DbLink = f"http://192.168.1.101:8080/uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_0.jpg"

    conn = get_db_connection()
    cursor = conn.cursor()
    use_DB = 'USE BookLibraryForUniversity;'
    query_insert_book_toDb = 'insert into Books (title, autor, book_description, link, last_page) values (%s, %s, %s, %s, %s);'
    params = (clearNamePdf, "bezAutora", "kNiga top", DbLink, f"{maxPage}")
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
    parse_books_by_index = 'select id, title, autor, book_year, link from BookLibraryForUniversity.Books where id > %s and id < %s;'
    params = (start_index, end_index)
    cursor.execute(parse_books_by_index, params)
    
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

    
    conn = get_db_connection()
    cursor = conn.cursor()
    parse_book_info = 'SELECT user_name, mail, university_group, user_password FROM BookLibraryForUniversity.Users where mail = %s;'
    params = (mail,)
    cursor.execute(parse_book_info, params)
    
    userInfo = cursor.fetchall()[0]
    if userInfo[3] != password:
        return jsonify({"result": "mail or password incorrect"})
    

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


# uploads/PngBooks
def saveJpegsFromPdf(namePdf, clearNamePdf):
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
    print(f"\n\nrun in browser by url earler ^ --\n\n")
    app.run(host='0.0.0.0', port=8080, debug=True)




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