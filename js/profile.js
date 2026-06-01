function initForms(){
    let request = document.getElementById("request");
    let resultField = document.getElementById("result");
    let profile_verification = document.getElementById("profile-verification");
    let profile_main = document.getElementById("profile-main");
    let profile_logout_btn = document.getElementById("profile-logout-btn");

    if(getUserSession().isLogined == true){
        // window.alert("logined");
        profile_verification.setAttribute('hidden', 'hidden');
        profile_main.removeAttribute("hidden", "hidden");
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

        let textResult = await uploadPDF(pdfInput, pdfInput.name, userInfo.user_name);
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

async function uploadPDF(file, bookId, autor) {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('book_id', bookId);
    formData.append('autor', autor);

    return await usePostRequest('/upload_pdf', formData);
}

document.addEventListener('DOMContentLoaded', initForms);