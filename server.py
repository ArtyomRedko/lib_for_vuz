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

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='1234'
    )
except Error as e:
    print(f"Ошибка подключения к mysql, ошибка: {e}")

cursor = conn.cursor()





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

@app.route('/index.js')
def serve_js():
    return send_from_directory('.', 'index.js')

@app.route('/index.css')
def serve_css():
    return send_from_directory('.', 'index.css')
    
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

    use_DB = 'USE BookLibraryForUniversity;'
    query_insert_book_toDb = 'insert into Books (title, autor, book_description, link) values (%s, %s, %s, %s);'
    params = (clearNamePdf, "bezAutora", "kNiga top", DbLink)
    cursor.execute(use_DB)
    cursor.execute(query_insert_book_toDb, params)
    conn.commit()
                                

    if os.path.exists(filePath):
        os.remove(filePath)
        print(f"{filePath} - deleted")

    return jsonify({"status": "ok", "maxPage": f"{maxPage}", "message": f"Книга {bookId} загружена", "link": f"{DbLink}"})

# uploads/PngBooks
def saveJpegsFromPdf(namePdf, clearNamePdf):
    pages = convert_from_path(f'uploads/{namePdf}', 150)
    os.mkdir(f'uploads/PngBooks/Directory-{clearNamePdf}')
    maxPage = 0

    for count, page in enumerate(pages):
        maxPage += 1
        page.save(f'uploads/PngBooks/Directory-{clearNamePdf}/{clearNamePdf}_{count}.jpg', 'JPEG')

    return maxPage


# http://100.86.48.107:8080/parserMessages?a=5&b=6
@app.route('/parserMessages', methods=['GET'])
def parser_messages():
    phone1 = request.args.get('a')
    phone2 = request.args.get('b')
    return jsonify({"a": phone1, "b": phone2})



if __name__ == '__main__':
    if not os.path.exists('uploads/PngBooks'):
        os.mkdir('uploads/PngBooks')
    print(f"\n\nrun in browser by url earler ^ --\n\n")
    app.run(host='0.0.0.0', port=8080, debug=True)






# @app.route('/upload_pdf', methods=['POST'])
# def uploadPdf():
#     print("ЗАПРОС ПОЛУЧЕН!")  # Это должно появиться в консоли сервера
#     return jsonify({"test": "hello world"})