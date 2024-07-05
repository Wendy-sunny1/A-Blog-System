document.addEventListener('click', function(event){
    if(event.target.classList.contains('notification-item')) {
        const resourceId = event.target.getAttribute('notice-id');

        console.log("------++------resourceId==="+resourceId)

        fetch(`/updateNotificationStatus/${resourceId}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error(error);
        });
    }
});
