(function() {
    let currentPage = 1;
    let totalPagesDemo = 42;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageIndicatorSpan = document.getElementById('pageIndicator');
    const jumpInput = document.getElementById('pageJumpInput');
    const jumpBtn = document.getElementById('jumpToPageBtn');
    const pageImageLabel = document.getElementById('pageImageLabel');

    function updatePaginationUI() {
        pageIndicatorSpan.textContent = `Страница ${currentPage} / ${totalPagesDemo}`;
        prevBtn.disabled = (currentPage <= 1);
        nextBtn.disabled = (currentPage >= totalPagesDemo);
        jumpInput.value = currentPage;
        jumpInput.max = totalPagesDemo;
        if (pageImageLabel) {
            pageImageLabel.textContent = `Изображение страницы № ${currentPage}`;
        }
    }

    function setPage(pageNum) {
        if (pageNum < 1) pageNum = 1;
        if (pageNum > totalPagesDemo) pageNum = totalPagesDemo;
        if (pageNum === currentPage) return;
        currentPage = pageNum;
        updatePaginationUI();
    }

    function nextPage() {
        if (currentPage < totalPagesDemo) setPage(currentPage + 1);
    }

    function prevPage() {
        if (currentPage > 1) setPage(currentPage - 1);
    }

    function jumpToPage() {
        let target = parseInt(jumpInput.value, 10);
        if (isNaN(target)) target = currentPage;
        if (target < 1) target = 1;
        if (target > totalPagesDemo) target = totalPagesDemo;
        setPage(target);
    }

    function initReader() {
        currentPage = 1;
        updatePaginationUI();

        prevBtn.addEventListener('click', prevPage);
        nextBtn.addEventListener('click', nextPage);
        jumpBtn.addEventListener('click', jumpToPage);
        jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') jumpToPage();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReader);
    } else {
        initReader();
    }
})();