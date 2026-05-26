(function(){

  function initelements(){
    // let request = document.getElementById("request");
    // let resultField = document.getElementById("result");
    let pageImage = document.getElementById('viewPage');
    // let displayBook = document.getElementById('displayBook');
    let btnPrevious = document.getElementById('prevPageBtn');
    let btnNext = document.getElementById('nextPageBtn');
    let searchPage = document.getElementById('pageJumpInput');

    let book;

    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('dragstart', event => {
      if (event.target.tagName === 'IMG') event.preventDefault();
    });

    // request.addEventListener("click", async function (){
    //     event.preventDefault();
    //     let pdfInput = document.getElementById("pdfInput").files[0];
    //     resultField.removeAttribute("hidden", "hidden");
    //     if (!String(pdfInput.name).match(/.+.pdf/i)) 
    //     {
    //       resultField.textContent = "choose only .pdf";
    //       return;
    //     }
    //     else resultField.textContent = "wait for process)";

    //     let textResult = await uploadPDF(pdfInput, pdfInput.name);
    //     textJsonPdf = textResult.link;
    //     resultField.setAttribute('hidden', 'hidden');
    //     window.alert("book is loaded"/*textJsonPdf*/);
    //     globalLink = textJsonPdf;
    //     maxPageG = textResult.maxPage;
    // });

    (async function initBook(){
      const url = new URL(window.location.href, window.location.origin);
      let bookId = url.searchParams.get("id");

      let book_info = await request_book_info(bookId);

      book = new Book(book_info.title, book_info.autor, book_info.link, book_info.last_page, pageImage);
      book.displayPage();
    })();

    btnNext.addEventListener("click", function (){
      if(!book.nextPage()){
        btnNext.setAttribute("disabled", "true");
      }
      btnPrevious.removeAttribute("disabled");
      book.displayPage();
    });

    btnPrevious.addEventListener("click", function (){
      if(!book.previousPage()){
        btnPrevious.setAttribute("disabled", "true");
      }
      btnNext.removeAttribute("disabled");
      book.displayPage();
    });

    searchPage.addEventListener("input", (event) => {
      book.searchPageByNumber(Number(event.target.value));
      book.displayPage();
    });

    class Book
  {
    firstPart = "";
    lastPart = "";
    #cover = "";
    link = ""
    currentPage = 1; // #
    maxPage = 0;
    

    constructor(title, autor, link, last_page, pageImage){
      this.maxPage = last_page;
      this.link = link;
      this.#cover = link;
      this.pageImage = pageImage;
      this.initializerLinkParts();
      this.createLink();
    }

    // pageImage.src = "http://0.0.0.0:8080/pages/Directory-БД_Пр_инф_систем_2025/БД_Пр_инф_систем_2025_9.jpg";
    initializerLinkParts(){
      this.firstPart = this.link.substring(0, this.link.length - (4 + String(Math.abs(this.currentPage)).length));
      this.lastPart = this.link.substring(this.link.length - 4);
    }

    createLink(){
      this.link = this.firstPart + this.currentPage + this.lastPart;
    }

    nextPage(){
      if (this.currentPage + 1 < this.maxPage){
        this.currentPage++;
        this.createLink();
        return true;
      }
      else return false;
    };
    previousPage(){
      if (this.currentPage - 1 > 0){
        this.currentPage--;
        this.createLink();
        return true;
      }
      else return false;
    }
    searchPageByNumber(number){
      if (number > 0 && number < this.maxPage){
        this.currentPage = number;
      }
      this.createLink()
    }
    displayPage(){
      pageImage.src = this.link;
    }
  };
  }



  

  // Базовый URL вашего сервера
  // const BASE_URL = 'http://100.86.48.107:8080';
  // const BASE_URL = window.location.origin;


  // Только для GET запросов
  async function routinesOfConnections(requestURL) {
    const response = await fetch(BASE_URL + requestURL);
    if (response.ok) {
      return await response.text(); // для текста
      // return await response.blob(); // для картинки
    }
    return '';
  }
  // Для POST нужна отдельная функция
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

  async function parserMessages(phone1, phone2) {
    const params = new URLSearchParams({ phone1, phone2 });
    const requestURL = '/parserMessages?' + params.toString();
    return await routinesOfConnections(requestURL);
  }

  async function request_book_info(book_id) {
    const formData = new FormData();
    formData.append('book_id', book_id);
    return await usePostRequest('/request_book_info', formData);
  }

  function initViever(){
      initelements();
  }

  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initViever);
  } else {
      initViever();
  }

})();
