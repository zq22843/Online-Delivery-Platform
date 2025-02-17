function editProfile() {
    // Clear the password-related input fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    // Hide the initial input fields and edit profile button
    document.getElementById('user-details').style.display = 'none';
    document.getElementById('edit-profile').style.display = 'none';

    // Show the edit form
    document.getElementById('edit-form').style.display = 'block';

    // Set the current values in the form fields
    document.getElementById('new-name').value = document.getElementById('name').innerText;
}

function returnToProfile() {
    // Show the user-details div
    document.getElementById('user-details').style.display = 'block';

    // Hide the edit form
    document.getElementById('edit-form').style.display = 'none';

    // Show the edit profile button
    document.getElementById('edit-profile').style.display = 'block';
}


function saveProfile() {
    const saveButton = document.getElementById("saveProfileChanges");
    saveButton.disabled = true;
    const cancelButton = document.getElementById("cancelProfileChanges");
    cancelButton.disabled = true;

    var driverId = document.getElementById('driverId').value;
    var currentPassword = document.getElementById('current-password').value;
    var name = document.getElementById('new-name').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    // Ensure both password fields match
    if (newPassword !== confirmPassword) {
        saveButton.disabled = false;
        cancelButton.disabled = false;
        alert("Passwords do not match");
        return;
    }

    var requestBody = {
        name: name,
        currentPassword: currentPassword
    };

    // Only include the password fields if they are not empty and not whitespace
    if (newPassword.trim() !== '' && confirmPassword.trim() !== '') {
        requestBody.newPassword = newPassword;
    }

    // Make a request to update the user's profile including the password
    fetch(`/drivers/${driverId}/driverProfile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (response.ok) {
                var name = document.getElementById('new-name').value;
                document.getElementById('name').innerText = name;

                returnToProfile();
            } else if (response.status === 401) {
                saveButton.disabled = false;
                cancelButton.disabled = false;
                alert("Invalid password");
            } else {
                saveButton.disabled = false;
                cancelButton.disabled = false;
                throw new Error('Failed to update profile');
            }
        })
        .catch(error => {
            saveButton.disabled = false;
            cancelButton.disabled = false;
            console.error('Error updating profile:', error);
            alert("Failed to update profile");
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.querySelector("#logout");
    logoutButton.addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href='/logout';
    })
});