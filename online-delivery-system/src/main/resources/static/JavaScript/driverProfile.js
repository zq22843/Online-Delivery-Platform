function editProfile() {

    // Clear the password-related input fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    document.querySelector('.name').style.display = 'none';
    document.getElementById('logout').style.display = 'none';

    document.getElementById('edit-form').style.display = 'block';

    // Set the current values in the form fields
    document.getElementById('new-name').value = document.querySelector('.name').innerText;
    // Hide buttons in the user-details div
    document.querySelector('#user-details button.edit-profile').style.display = 'none';
}

function returnToProfile() {
    document.querySelector('.name').style.display = 'block';
    document.getElementById('logout').style.display = 'inline-block';

    document.getElementById('edit-form').style.display = 'none';

    // Show the edit profile button again
    document.querySelector('#user-details button.edit-profile').style.display = 'inline-block';
}

function cancelEdit() {
    returnToProfile();
}

function saveProfile() {
    var driverId = document.getElementById('driverId').value;
    var currentPassword = document.getElementById('current-password').value;
    var name = document.getElementById('new-name').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    // Ensure both password fields match
    if (newPassword !== confirmPassword) {
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
                alert("Profile updated successfully");
                document.querySelector('.name').innerText = name;
                returnToProfile();
            } else if (response.status === 401) {
                // Unauthorized, display invalid password alert
                alert("Invalid password");
            } else {
                throw new Error('Failed to update profile');
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            alert("Failed to update profile 123456");
        });
}