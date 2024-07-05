const imgUploadBtn = document.querySelector('#imgUploadBtn');
const originalArticle = document.querySelector('#article-container');
const articleID = document.querySelector('#id').innerText;
const imgUploadForm = document.querySelector('#imgUploadForm');
const btnChangeImg = document.querySelector('#btnChangeImg');
const btnRemoveImg = document.querySelector('#btnRemoveImg');
const btnAddImg = document.getElementById('btnAddImg');

let imgTempContainer = document.querySelector('#imgTempContainer');
let uploadBtnClickedFlag = false;

imgUploadForm.classList.toggle('invisible');

let btnAddImgClickedFlag = false;
let btnChangeImgClickedFlag = false;
let btnRemoveImgClickedFlag = false;
let btnImgRemovedClickedFlag = false;

function removeEmptyParagraphs(inputString) {
    var resultString = inputString.replace(/<p><br><\/p>/g, '');

    return resultString;
}

/**
 * Remove image button
 */
if (btnRemoveImg) {
    btnRemoveImg.classList.toggle('invisible');
    btnRemoveImg.addEventListener('click', () => {
        if (!btnImgRemovedClickedFlag) {
            updateArticleWithImgURL('');
            btnRemoveImg.innerText = 'image removed!';
            btnRemoveImgClickedFlag = !btnRemoveImgClickedFlag;

            btnChangeImg.innerText = 'click to add image';

            document
                .querySelector('.article-img')
                .classList.toggle('invisible');

            btnImgRemovedClickedFlag = !btnImgRemovedClickedFlag;
        }
    });
}

/**
 * Change image button
 */
if (btnChangeImg) {
    btnChangeImg.classList.toggle('invisible');

    btnChangeImg.addEventListener('click', () => {
        if (!uploadBtnClickedFlag) {
            btnChangeImgClickedFlag = !btnChangeImgClickedFlag;
            if (btnChangeImgClickedFlag) {
                btnChangeImg.innerText = 'discard';
            } else {
                if (btnRemoveImgClickedFlag) {
                    btnChangeImg.innerText = 'click to add image';
                } else {
                    btnChangeImg.innerText = 'click to change image';
                }
            }
            imgUploadForm.classList.toggle('invisible');
            processUserUploadedImg();
        }
    });
}

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

//////////////////////////////

/**
 * Add image button
 */
if (btnAddImg) {
    btnAddImg.classList.toggle('invisible');

    btnAddImg.addEventListener('click', () => {
        if (!uploadBtnClickedFlag) {
            imgUploadForm.classList.toggle('invisible');
            btnAddImgClickedFlag = !btnAddImgClickedFlag;

            if (btnAddImgClickedFlag) {
                btnAddImg.innerText = 'discard';
            } else {
                btnAddImg.innerText = 'click to add image';
            }
        }
    });
}

//////////////////////////////
let btnEdition = document.querySelector('.btnEdition');

let quillContainer = document.querySelector('#editor-container');
let toolbar = document.querySelector('.ql-toolbar');

quillContainer.classList.add('invisible');
toolbar.classList.add('invisible');

let btnClickedFlag = false;

function updateUI() {
    if (btnClickedFlag) {
        // "btnEdit" clicked
        btnEdition.classList.add('btnDoneEditing');
        btnEdition.textContent = 'done editing';
        quill.clipboard.dangerouslyPasteHTML(originalArticle.innerHTML);
        originalArticle.innerHTML = ``;

        const btnDoneEditing = document.querySelector('.btnDoneEditing');
        btnDoneEditing.addEventListener('click', () => {
            imgTempContainer.innerHTML = ``;
            const htmlContent = quill.root.innerHTML;
            let content = removeLeadingAndTrailingEmptyParagraphs(htmlContent);
            content = removeEmptyParagraphs(content);
            originalArticle.innerHTML = `${content}`;

            ///////////
            const title = getArticleTitle(content);
            const publishTime = getArticlePublishTime();
            let articlesObj = {
                title,
                publishTime,
                content,
                articleID,
            };

            fetch('/updateArticle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articlesObj),
            }).then(() => {
                window.location.reload();
            });
        });
        toggleBtnItemsVisibility();
    } else {
        btnEdition.classList.remove('btnDoneEditing');
        btnEdition.textContent = 'edit this article';
        btnEdition.addEventListener('click', () => {
            originalArticle.innerHTML = ``;
        });

        toggleBtnItemsVisibility();
    }
}

btnEdition.addEventListener('click', () => {
    btnClickedFlag = !btnClickedFlag;
    updateUI();
});

/*******************************************************************
 * Below are helper functions:
 */

function toggleBtnItemsVisibility() {
    quillContainer.classList.toggle('invisible');
    toolbar.classList.toggle('invisible');

    if (btnAddImg) {
        btnAddImg.classList.toggle('invisible');
    }
    if (btnRemoveImg) {
        btnRemoveImg.classList.toggle('invisible');
    }
    if (btnChangeImg) {
        btnChangeImg.classList.toggle('invisible');
    }
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
 * Belows are Ian's codes added in feature/article-img-upload-v1 branch
 */
imgUploadBtn.addEventListener('click', () => {
    processUserUploadedImg();
});

function processUserUploadedImg() {
    const formData = new FormData(imgUploadForm);

    const fileInput = document.querySelector('#fileInput');

    if (fileInput.files.length > 0 && !uploadBtnClickedFlag) {
        imgUploadBtn.innerText = 'image uploaded!';
        fetch('/uploadImage', {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle the response from the server
                // rn we have the imageURL

                // should update an article with only imgURL and userID
                updateArticleWithImgURL(data.imageURL.substring(8));

                uploadBtnClickedFlag = !uploadBtnClickedFlag;

                const imgElement = document.createElement('img');
                imgElement.src = data.imageURL.substring(8);
                imgElement.classList.add('tempImg');
                console.log(data.imageURL.substring(8));
                imgTempContainer.appendChild(imgElement);
            });
    }
}

///
function updateArticleWithImgURL(imageURL) {
    let articlesObj = {
        imageURL,
        articleID,
    };
    fetch('/updateArticleWithImgURL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articlesObj),
    });
}
