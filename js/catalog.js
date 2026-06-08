// Эту логику делала нейронка, нужно все поменять
function catalogInit() {

    BOOKS_DATA = [];
    

    var textList;
    BooksData2 = [];

    let currentPage = 1;
    // let filteredBooks = [...BOOKS_DATA];
    const BOOKS_PER_PAGE = 8;

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
        // Добавьте эту проверку в начало функции
        if (str === undefined || str === null) {
            return '';
        }
        
        // Преобразуем в строку на всякий случай
        const safeStr = String(str);

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
    async function request_books(start_index, end_index, group, role) {
        const formData = new FormData();
        formData.append('start_index', start_index);
        formData.append('end_index', end_index);
        formData.append('group', group);
        formData.append('role', role);
        
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
        for (const book of paginatedBooks) { // <a class="reader-link" href="reader.html?id=${book.id}">Подробнее</a>
            html += `
                <div class="book-card" data-href="reader.html?id=${book.id}">
                    
                    <div class="book-cover"><img class="cover" src="${book.cover}"></div>
                    <div class="book-info">
                        <div class="book-title">название: ${escapeHtml(book.title)}</div>
                        <div class="book-author">автор: ${escapeHtml(book.author)}</div>
                        <div class="book-year">год: ${escapeHtml(book.year)}</div>
                        <div class="book-description">краткое описание: ${escapeHtml(book.description)}</div>
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
        document.querySelectorAll('.book-card').forEach(container => {
            container.addEventListener('click', (e) => {
                const href = container.dataset.href;
                if (href) window.location.href = href;
            });
        });
    }



    async function initCatalog() {
        if (getUserSession().isLogined == null) textList = await request_books(0, 15, "guest", "guest");
        else textList = await request_books(0, 15, getUserSession().group, getUserSession().role);
        let rowdata = textList.BookList.split("@").map((x) => x.split(","));
        BOOKS_DATA = rowdata.map(([id, title, author, year, cover, description]) => ({
            id: id,
            title: title,
            author: author,
            year: year,
            cover: cover,
            description: description
        }));
        // window.alert(BOOKS_DATA);
        filteredBooks = [...BOOKS_DATA];
        currentPage = 1;
        renderCatalog();
        bindCatalogEvents();        
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCatalog);
    } else {
        initCatalog();
    }
};

document.addEventListener('DOMContentLoaded', catalogInit);
