function initForms(){
    let request = document.getElementById("request");
    let resultField = document.getElementById("result");

    
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

        let textResult = await uploadPDF(pdfInput, pdfInput.name);
        textJsonPdf = textResult.link;
        resultField.setAttribute('hidden', 'hidden');
        window.alert("book is loaded"/*textJsonPdf*/);
        globalLink = textJsonPdf;
        maxPageG = textResult.maxPage;
    });
}

async function usePostRequest(requestURL, formData) {
    const response = await fetch(requestURL, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

async function uploadPDF(file, bookId) {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('book_id', bookId);

    return await usePostRequest('/upload_pdf', formData);
}

document.addEventListener('DOMContentLoaded', initForms);