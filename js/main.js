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
    const currentPage = window.location.pathname.split('/').pop() || '../index.html';
    const links = document.querySelectorAll('.header-nav a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === '../index.html')) {
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

// Для POST нужна отдельная функция
async function usePostRequest(requestURL, formData) {
    const response = await fetch(requestURL, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

async function initPage() {
    await Promise.all([
        loadComponent('../components/header.html', 'header-container'),
        loadComponent('../components/footer.html', 'footer-container')
    ]);
    setActiveMenu();
    initLoginToggle(); 

    // let register_login_buttons = document.getElementById("register_login_buttons");
    // if(getUserSession().isLogined == true) register_login_buttons.setAttribute('hidden', 'hidden');
    // else register_login_buttons.removeAttribute('hidden', 'hidden');

    // Дождаться, пока DOM точно обновится
    setTimeout(() => {
        let register_login_buttons = document.getElementById("register_login_buttons");
        if (register_login_buttons) {
            if (getUserSession().isLogined == true) {
                register_login_buttons.setAttribute('hidden', 'true');
            } else {
                register_login_buttons.removeAttribute('hidden');
            }
        }
    }, 100); // или 100, если 0 не помогает
    
}

document.addEventListener('DOMContentLoaded', initPage);