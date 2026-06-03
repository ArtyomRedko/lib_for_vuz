function initForms(){
    let request = document.getElementById("request");
    let resultField = document.getElementById("result");
    let profile_verification = document.getElementById("profile-verification");
    let profile_main = document.getElementById("profile-main");
    let profile_logout_btn = document.getElementById("profile-logout-btn");
    let student_info = document.getElementById("student-info");
    let upload_controls = document.getElementById("upload-section-id");
    

    let name_place = document.getElementById("name-place");
    let role_place = document.getElementById("role-place");
    let email_place = document.getElementById("email-place");
    let group_place = document.getElementById("group-place");

    let profile_description = document.getElementById("profile-description");
    let profile_year = document.getElementById("profile-year");
    let profile_groups = document.getElementById("profile-groups");

    if(getUserSession().isLogined == true){
        // window.alert("logined");
        profile_verification.setAttribute('hidden', 'hidden');
        profile_main.removeAttribute("hidden", "hidden");
        name_place.innerHTML = getUserSession().user_name;
        role_place.innerHTML = getUserSession().role;
        email_place.innerHTML = getUserSession().mail;
        if( getUserSession().role == "student"){
            student_info.removeAttribute("hidden", "hidden");
            upload_controls.setAttribute('hidden', 'hidden');
            group_place.innerHTML = getUserSession().group;
        }
    }

    
    request.addEventListener("click", async function (){
        event.preventDefault();
        let pdfInput = document.getElementById("pdfInput").files[0];
        resultField.removeAttribute("hidden", "hidden");
        if (!String(pdfInput.name).match(/.+.pdf/i)) 
        {
        resultField.textContent = "choose only .pdf";
        return;
        }
        else resultField.textContent = "wait for process)";
        let userInfo = getUserSession();

        let textResult = await uploadPDF(pdfInput, pdfInput.name, userInfo.user_name, profile_description.value, profile_year.value, profile_groups.value);
        textJsonPdf = textResult.link;
        resultField.setAttribute('hidden', 'hidden');
        // window.alert("book is loaded"/*textJsonPdf*/);
        globalLink = textJsonPdf;
        maxPageG = textResult.maxPage;
    });

    profile_logout_btn.addEventListener("click", function (){
        saveUserSession({user_name: null, mail: null, isLogined: null});
        window.location.reload();
    });
}

async function usePostRequest(requestURL, formData) {
    const response = await fetch(requestURL, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

async function uploadPDF(file, bookId, autor, description, year, groups) {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('book_id', bookId);
    formData.append('autor', autor);
    formData.append('description', description);
    formData.append('year', year);
    formData.append('groups', groups);

    return await usePostRequest('/upload_pdf', formData);
}

document.addEventListener('DOMContentLoaded', initForms);