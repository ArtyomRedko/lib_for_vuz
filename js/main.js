async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка загрузки ${url}`);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error(error);
        document.getElementById(containerId).innerHTML = `<p style="color:red">Не удалось загрузить ${url}</p>`;
    }
}

function setActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.header-nav a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initLoginToggle() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (!tabBtns.length || !loginForm || !registerForm) return;

    function switchToForm(formName) {
        if (formName === 'register') {
            loginForm.classList.remove('active-form');
            registerForm.classList.add('active-form');
            tabBtns.forEach(btn => {
                if (btn.getAttribute('data-form') === 'register') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } else {
            registerForm.classList.remove('active-form');
            loginForm.classList.add('active-form');
            tabBtns.forEach(btn => {
                if (btn.getAttribute('data-form') === 'login') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-form');
            switchToForm(target);
            if (target === 'register') {
                window.location.hash = 'register';
            } else {
                window.location.hash = '';
            }
        });
    });

    // При загрузке страницы проверяем hash
    if (window.location.hash === '#register') {
        switchToForm('register');
    } else {
        switchToForm('login');
    }
}


async function initPage() {
    await Promise.all([
        loadComponent('/components/header.html', 'header-container'),
        loadComponent('/components/footer.html', 'footer-container')
    ]);
    setActiveMenu();
    initLoginToggle(); 
}

document.addEventListener('DOMContentLoaded', initPage);