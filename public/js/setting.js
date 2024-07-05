document.addEventListener('DOMContentLoaded', function () {
    const newUsernameInput = document.getElementById('newUsername');
    const usernameError = document.getElementById('ChangeUsernameTakenError');

    newUsernameInput.addEventListener('input', () => {
        const newUsername = newUsernameInput.value;

        if (newUsername) {
            // same as what we do for creating accounts
            fetch('/checkUsernameAvailability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.usernameExists) {
                        usernameError.textContent = 'Username already exists.';
                    } else {
                        usernameError.textContent = '';
                    }
                })
                .catch((error) => {
                    console.error(
                        'Error checking username availability:',
                        error
                    );
                });
        }
    });
});

async function deleteAccountAlert(event) {
    event.preventDefault(); // blocking the form to be submitted by default
    const deleteAccountInput = document.getElementById('deleteCurrentAccount');
    const deleteAccountValue = deleteAccountInput.value;

    if (deleteAccountValue === '') {
        alert('Please enter your username to confirm account deletion.');
    } else if (
        confirm(
            'Are you sure you want to delete your account? This action cannot be undone!'
        )
    ) {
        const form = document.getElementById('deleteAccountForm');
        form.submit(); // manually submit
    }
}

// if delete clicked, deleteAccountAlert() triggers.
const deleteAccountForm = document.getElementById('deleteAccountForm');
deleteAccountForm.addEventListener('submit', deleteAccountAlert);


