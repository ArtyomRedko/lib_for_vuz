
function saveUserSession(userData) {
    localStorage.setItem('user', JSON.stringify({
        user_name: userData.user_name,
        mail: userData.mail,
        isLogined: userData.isLogined,
        role: userData.role,
        group: userData.group,
        /*university_subgroup: userData.university_subgroup*/
    }));
}

function getUserSession() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;  // ← важно: проверяем, есть ли данные
    const parsed = JSON.parse(userData);
    return parsed;
}



