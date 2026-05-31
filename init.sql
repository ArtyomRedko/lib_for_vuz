-- init.sql
CREATE DATABASE IF NOT EXISTS BookLibraryForUniversity;
USE BookLibraryForUniversity;

CREATE TABLE IF NOT EXISTS Books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    autor VARCHAR(255),
    book_description TEXT,
    link VARCHAR(500),
    last_page INT,
    book_year INT,
    cover_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    mail VARCHAR(255) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    university_group VARCHAR(100),
    university_subgroup VARCHAR(50),
    university_role VARCHAR(50)
);

-- Индексы для ускорения поиска
CREATE INDEX idx_books_title ON Books(title);
CREATE INDEX idx_books_autor ON Books(autor);
CREATE INDEX idx_books_title_autor ON Books(title, autor);