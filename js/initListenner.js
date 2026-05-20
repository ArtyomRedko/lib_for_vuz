function initForms(){
    let login_form = document.getElementById("login-form");
    let register_form = document.getElementById("register-form");

    login_form.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.alert("register");
        let form_login_mail = document.getElementById("form-login-mail").value;
        let form_login_pass = document.getElementById("form-login-pass").value;

        const formData = new FormData();
        formData.append('mail', form_login_mail);
        formData.append('password', form_login_pass);
        
        let result = await usePostRequest('/request_login', formData);
        if (result.result == "success") {
            window.alert("success login)");
            saveUserSession({user_name: result.name, mail: form_login_mail});
            
            window.alert(getUserSession().mail);
        }
        location.reload();
    })

    register_form.addEventListener("submit", async (e) => {
        e.preventDefault();
        window.alert("register");
        let form_register_fullName = document.getElementById("form-register-fullName").value;
        let form_register_mail = document.getElementById("form-register-mail").value;
        let form_register_pass = document.getElementById("form-register-pass").value;
        let form_register_pass2 = document.getElementById("form-register-pass2").value;

        if (form_register_pass != form_register_pass2) window.alert("passwords not the same)");

        const formData = new FormData();
        formData.append('mail', form_register_mail);
        formData.append('password', form_register_pass);
        formData.append('fullName', form_register_fullName);
        
        let result = await usePostRequest('/request_register', formData);
        if (result.result == "success") window.alert("success register)");
        window.alert(result.result);
    })
};


document.addEventListener('DOMContentLoaded', initForms);