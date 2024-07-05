// Toggle visibility of nested-comments
const toggleButton = document.getElementById('toggleComments');
const commentsContainer = document.getElementById('nested-comments');

toggleButton.addEventListener('click', () => {
    if (commentsContainer.style.display === 'none' || commentsContainer.style.display === '') {
        commentsContainer.style.display = 'block';
        toggleButton.innerHTML = '&#9650; Hide Comments';
    } else {
        commentsContainer.style.display = 'none';
        toggleButton.innerHTML = '&#9660; Show Comments';
    }
});

// Toggle display of the reply editor on the article page
document.querySelectorAll('.reply-link').forEach(replyLink => {
    replyLink.addEventListener('click', function (event) {
        event.preventDefault();

        // Hide all reply forms
        document.querySelectorAll('.reply-container').forEach(replyContainer => {
            replyContainer.style.display = 'none';
        });

        // Show the clicked reply form
        const replyContainer = this.nextElementSibling;
        replyContainer.style.display = 'block';

    });
});

// Add JavaScript to handle delete operations
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-link')) {
        const resourceId = event.target.getAttribute('comment-id');
        const resourceOwner = event.target.getAttribute('commenter');

        // Send a DELETE request to delete the resource
        fetch(`/${resourceOwner}/comments/${resourceId}/remove`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Optionally, update the UI to reflect the deletion
                
            })
            .catch(error => {
                console.error(error);
            });
    }
});


