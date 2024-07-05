const imgUploadBtn = document.querySelector('#imgUploadBtn');
const userID = document.querySelector('#uid').innerText;
let imgTempContainer = document.querySelector('#imgTempContainer');
let articleID;

let userSubmittedImgFlag = false;

let uploadBtnClickedFlag = false;

// QuillJS editor setup:
let toolbaroptions = [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ size: ['small', 'large', 'huge', false] }],
];

let quill = new Quill('#editor-container', {
    modules: {
        toolbar: toolbaroptions,
    },
    theme: 'snow',
});

////////////////////////////////////////////////////////////
let btnAddNewArticles = document.querySelector('.btnAddNewArticles');

let quillContainer = document.querySelector('#editor-container');
let toolbar = document.querySelector('.ql-toolbar');

const imgUploadForm = document.querySelector('#imgUploadForm');

quillContainer.classList.add('invisible');
toolbar.classList.add('invisible');
imgUploadForm.classList.add('invisible');

let btnClickedFlag = false; // havent clicked btn

function updateUI() {
    if (btnClickedFlag) {
        // btn has been clicked
        imgUploadForm.classList.toggle('invisible');
        btnAddNewArticles.classList.add('btnAdd');
        btnAddNewArticles.textContent = 'add';
        const btnAdd = document.querySelector('.btnAdd');

        btnAdd.addEventListener('click', () => {
            imgTempContainer.innerHTML = ``;
            imgUploadBtn.innerText = 'click to upload';

            const htmlContent = quill.root.innerHTML;
            const textContent = quill.getText();
            quill.setContents([]);
            let content = removeLeadingAndTrailingEmptyParagraphs(htmlContent);
            content = removeEmptyParagraphs(content);
            if (textContent.trim().length !== 0) {
                const title = getArticleTitle(content);
                const publishTime = getArticlePublishTime();

                let articlesObj = {
                    title,
                    publishTime,
                    content,
                    userID,
                    articleID,
                };

                //////// here to check whether to create or update
                if (userSubmittedImgFlag) {
                    // should update
                    fetch('/updateArticle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(articlesObj),
                    }).then(() => {
                        window.location.reload();
                    });

                    // update complete
                    // window.reload
                    userSubmittedImgFlag = !userSubmittedImgFlag;
                } else {
                    // should createNew
                    fetch('/createNewArticle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(articlesObj),
                    }).then(() => {
                        window.location.href = '/user';
                    });
                }
            }
        });
        /////////////////////////////////////
        quillContainer.classList.toggle('invisible');
        toolbar.classList.toggle('invisible');
    } else {
        // btn has not been clicked
        imgUploadForm.classList.toggle('invisible');
        btnAddNewArticles.classList.remove('btnAdd');
        btnAddNewArticles.textContent = 'click to create new articles';
        /////////////////////////////////////
        quillContainer.classList.toggle('invisible');
        toolbar.classList.toggle('invisible');
    }
}

btnAddNewArticles.addEventListener('click', () => {
    btnClickedFlag = !btnClickedFlag;
    updateUI();
});

/*******************************************************************
 * Below are helper functions:
 */
function removeEmptyParagraphs(inputString) {
    var resultString = inputString.replace(/<p><br><\/p>/g, '');

    return resultString;
}

function removeLeadingAndTrailingEmptyParagraphs(inputString) {
    // Use a regular expression to match and remove leading "<p><br></p>" patterns
    const leadingRegex = /^(<p><br><\/p>)+/;
    const stringWithoutLeading = inputString.replace(leadingRegex, '');

    // Use a regular expression to match and remove trailing "<p><br></p>" patterns
    const trailingRegex = /(<p><br><\/p>)+$/;
    const resultString = stringWithoutLeading.replace(trailingRegex, '');

    return resultString;
}

function getArticleTitle(htmlString) {
    // Use a regular expression to match the content inside the first <h1></h1> tag
    const regex = /<h1>(.*?)<\/h1>/i;
    const match = htmlString.match(regex);

    if (match && match[1]) {
        return match[1]; // Return the content inside the first <h1></h1>
    } else {
        return 'Untitled';
    }
}

function getArticlePublishTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Below are codes for User article img upload
 */

imgUploadBtn.addEventListener('click', () => {
    const formData = new FormData(imgUploadForm);

    const fileInput = document.querySelector('#fileInput');

    if (fileInput.files.length > 0 && !uploadBtnClickedFlag) {
        imgUploadBtn.innerText = 'image uploaded!';
        // the current author decided to upload an img
        userSubmittedImgFlag = !userSubmittedImgFlag;
        fetch('/uploadImage', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response from the server
                // rn we have the imageURL

                // should create an article with only imgURL and userID
                createArticleWithImgURL(data.imageURL.substring(8));

                uploadBtnClickedFlag = !uploadBtnClickedFlag;

                const imgElement = document.createElement('img');
                imgElement.src = data.imageURL.substring(8);
                imgElement.classList.add('tempImg');
                console.log(data.imageURL.substring(8));
                imgTempContainer.appendChild(imgElement);
            });
    }
});

function createArticleWithImgURL(imgURL) {
    let articlesObj = {
        imgURL,
        userID,
    };

    fetch('/createNewArticleWithImgURL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articlesObj),
    })
        .then((response) => response.json())
        .then((data) => {
            articleID = data.newArticleID;
        });
}
