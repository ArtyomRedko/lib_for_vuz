
function saveUserSession(userData) {
    localStorage.setItem('user', JSON.stringify({
        user_name: userData.user_name,
        mail: userData.mail,
        isLogined: true,
        /*university_role: userData.role,
        university_group: userData.group,
        university_subgroup: userData.university_subgroup*/
    }));
}

function getUserSession() {
    const userData = localStorage.getItem('user');
    const parsed = JSON.parse(userData);
    return parsed;
}



