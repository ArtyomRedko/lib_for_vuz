// Эту логику делала нейронка, нужно все поменять
(function() {
    BOOKS_DATA = [
        { id: 1, title: "Мастер и Маргарита", author: "Михаил Булгаков", year: 1967, cover: "📖" },
        { id: 2, title: "Преступление и наказание", author: "Фёдор Достоевский", year: 1866, cover: "📘" },
        { id: 3, title: "Война и мир", author: "Лев Толстой", year: 1869, cover: "📕" },
        { id: 4, title: "Евгений Онегин", author: "Александр Пушкин", year: 1833, cover: "📙" },
        { id: 5, title: "Мёртвые души", author: "Николай Гоголь", year: 1842, cover: "📔" },
        { id: 6, title: "Тихий Дон", author: "Михаил Шолохов", year: 1940, cover: "📗" },
        { id: 7, title: "Собачье сердце", author: "Михаил Булгаков", year: 1925, cover: "📓" },
        { id: 8, title: "Анна Каренина", author: "Лев Толстой", year: 1877, cover: "📒" },
        { id: 9, title: "Идиот", author: "Фёдор Достоевский", year: 1869, cover: "📚" },
        { id: 10, title: "Братья Карамазовы", author: "Фёдор Достоевский", year: 1880, cover: "📜" },
        { id: 11, title: "Капитанская дочка", author: "Александр Пушкин", year: 1836, cover: "📖" },
        { id: 12, title: "Герой нашего времени", author: "Михаил Лермонтов", year: 1840, cover: "📘" },
        { id: 13, title: "Ревизор", author: "Николай Гоголь", year: 1836, cover: "📙" },
        { id: 14, title: "Отцы и дети", author: "Иван Тургенев", year: 1862, cover: "📗" }
    ];

    BooksData2 = [];

    let currentPage = 1;
    let filteredBooks = [...BOOKS_DATA];
    const BOOKS_PER_PAGE = 6;

    const catalogGrid = document.getElementById('catalogGrid');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicator = document.getElementById('pageIndicator');
    const pageJumpInput = document.getElementById('pageJumpInput');
    const jumpToPageBtn = document.getElementById('jumpToPageBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const resultsInfo = document.getElementById('resultsInfo');

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
            return c;
        });
    }

    // Для POST нужна отдельная функция
    async function usePostRequest(requestURL, formData) {
        const response = await fetch(requestURL, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }


    // request for boks here...
    async function request_books(start_index, end_index) {
        const formData = new FormData();
        formData.append('start_index', start_index);
        formData.append('end_index', end_index);
        
        return await usePostRequest('/request_books', formData);
    }

    function renderCatalog() {
        const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        
        const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
        const paginatedBooks = filteredBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
        
        pageIndicator.textContent = `Страница ${currentPage} / ${totalPages}`;
        pageJumpInput.value = currentPage;
        pageJumpInput.max = totalPages;
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        if (filteredBooks.length === 0) {
            catalogGrid.innerHTML = `<div class="no-results">По вашему запросу ничего не найдено. Попробуйте изменить поиск.</div>`;
            resultsInfo.textContent = `Найдено: 0 книг`;
            return;
        }
        
        let html = '';
        for (const book of paginatedBooks) {
            html += `
                <div class="book-card">
                    <div class="book-cover">${book.cover}</div>
                    <div class="book-info">
                        <div class="book-title">${escapeHtml(book.title)}</div>
                        <div class="book-author">${escapeHtml(book.author)}</div>
                        <div class="book-year">${book.year}</div>
                        <a class="reader-link" href="reader.html?id=${book.id}">Подробнее</a>
                    </div>
                </div>
            `;
        }
        catalogGrid.innerHTML = html;
        resultsInfo.textContent = `Найдено: ${filteredBooks.length} книг | Показано ${paginatedBooks.length} на стр. ${currentPage}`;
    }

    function applySearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (query === '') {
            filteredBooks = [...BOOKS_DATA];
        } else {
            filteredBooks = BOOKS_DATA.filter(book => 
                book.title.toLowerCase().includes(query) || 
                book.author.toLowerCase().includes(query)
            );
        }
        currentPage = 1;
        renderCatalog();
    }

    function resetSearch() {
        searchInput.value = '';
        filteredBooks = [...BOOKS_DATA];
        currentPage = 1;
        renderCatalog();
    }

    function goToPage(page) {
        const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        if (page === currentPage) return;
        currentPage = page;
        renderCatalog();
    }

    function nextPage() {
        const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;
        if (currentPage < totalPages) goToPage(currentPage + 1);
    }

    function prevPage() {
        if (currentPage > 1) goToPage(currentPage - 1);
    }

    function jumpToPage() {
        let targetPage = parseInt(pageJumpInput.value, 10);
        if (isNaN(targetPage)) targetPage = 1;
        const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE) || 1;
        if (targetPage < 1) targetPage = 1;
        if (targetPage > totalPages) targetPage = totalPages;
        goToPage(targetPage);
    }

    function bindCatalogEvents() {
        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);
        jumpToPageBtn.addEventListener('click', jumpToPage);
        pageJumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') jumpToPage();
        });
        searchBtn.addEventListener('click', applySearch);
        resetSearchBtn.addEventListener('click', resetSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applySearch();
        });
    }


    async function initCatalog() {
        bindCatalogEvents();
        filteredBooks = [...BOOKS_DATA];
        currentPage = 1;
        renderCatalog();
        let textList = await request_books(2, 7);
        window.alert(textList.BookList);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCatalog);
    } else {
        initCatalog();
    }
})();