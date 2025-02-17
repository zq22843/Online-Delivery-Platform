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
    document.getElementById('new-description').value = document.getElementById('description').innerText;
}

function returnToProfile() {
    // Show the details divs
    document.getElementById('user-details').style.display = 'block';

    document.getElementById('address-details').style.display = 'block';

    // Hide the edit forms
    document.getElementById('edit-form').style.display = 'none';

    document.getElementById('address-fields').style.display = 'none';

    // Show the edit buttons
    document.getElementById('edit-profile').style.display = 'block';

    document.getElementById('edit-address-btn').style.display = 'block';
}

function saveProfile() {
    const saveButton = document.getElementById("saveProfileChanges");
    saveButton.disabled = true;
    const cancelButton = document.getElementById("cancelProfileChanges");
    cancelButton.disabled = true;

    var vendorId = document.getElementById('vendorId').value;
    var currentPassword = document.getElementById('current-password').value;
    var name = document.getElementById('new-name').value;
    var description = document.getElementById('new-description').value;
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
        description: description,
        currentPassword: currentPassword
    };

    // Only include the password fields if they are not empty and not whitespace
    if (newPassword.trim() !== '' && confirmPassword.trim() !== '') {
        requestBody.newPassword = newPassword;
    }

    // Make a request to update the user's profile including the password
    fetch(`/vendors/${vendorId}/vendorProfile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (response.ok) {
                var name = document.getElementById('new-name').value;
                var description = document.getElementById('new-description').value;

                document.getElementById('name').innerText = name;
                document.getElementById('description').innerText = description;
              
                saveButton.disabled = false;
                cancelButton.disabled = false;

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

function editAddress() {
    document.getElementById('address-details').style.display = 'none';
    document.getElementById('edit-address-btn').style.display = 'none';

    document.getElementById('address-fields').style.display = 'block';

    // Set the current values in the form fields
    document.getElementById('street').value = document.getElementById('current-street').innerText;
    document.getElementById('city').value = document.getElementById('current-city').innerText;
    document.getElementById('country').value = document.getElementById('current-country').innerText;
    document.getElementById('postCode').value = document.getElementById('current-postcode').innerText;
}

function isValidPostcode(postcode) {
    // Regular expression for UK postcodes
    var postcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i;
    return postcodeRegex.test(postcode);
}

function saveAddress() {
    const saveButton = document.getElementById("saveAddressChanges");
    saveButton.disabled = true;
    const cancelButton = document.getElementById("cancelAddressChanges");
    cancelButton.disabled = true;

    var street = document.getElementById('street').value;
    var city = document.getElementById('city').value;
    var postCode = document.getElementById('postCode').value;
    var country = document.getElementById('country').value;
    var email = document.getElementById('vendorId').value;

    if (!street || !city || !postCode || !country) {
        saveButton.disabled = false;
        cancelButton.disabled = false;
        alert("Please fill in all address fields");
        return;
    }

    if (!isValidPostcode(postCode)) {
        saveButton.disabled = false;
        cancelButton.disabled = false;
        alert("Invalid postcode");
        return;
    }

    // Make a request to fetch vendor data
    fetch(`/vendors/${email}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(vendor => {
            // Construct the address object with the vendor data
            var addressData = {
                vendor: vendor,
                street: street,
                city: city,
                postCode: postCode,
                country: country,
            };
            // Check if there's an existing address for the vendor
            fetch(`/vendorAddresses/vendor/${email}`, {
                method: 'GET'
            })
                .then(response => {
                    if (response.ok) {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        // Add the id to the addressData object (needed because it won't be generated this time; we're patching not posting)
                        return response.json().then(existingAddress => {
                            addressData.id = existingAddress.id;

                            // Perform a PATCH request to update the existing address
                            return fetch(`/vendorAddresses/vendor/${email}`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(addressData)
                            });
                        });
                    } else if (response.status === 404) {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        return fetch(`/vendorAddresses`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(addressData)
                        });
                    } else {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        throw new Error('Failed to fetch address data');
                    }
                })
                .then(response => {
                    if (response.ok) {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        returnToProfile();
                    } else {
                        saveButton.disabled = false;
                        cancelButton.disabled = false;
                        throw new Error('Failed to update address');
                    }
                })
                .catch(error => {
                    saveButton.disabled = false;
                    cancelButton.disabled = false;
                    console.error('Error updating address:', error);
                    alert("Failed to update address");
                });
        })
        .catch(error => {
            saveButton.disabled = false;
            cancelButton.disabled = false;
            console.error('Error fetching vendor data:', error);
            alert("Failed to fetch vendor data");
        });
}

function updateProfilePicture() {
    var input = document.getElementById('imageInput');
    var preview = document.getElementById('previewImage');

    var file = input.files[0];

    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            uploadImage(file)
        };
        reader.readAsDataURL(file);
    }
}

var mimeTypeExtensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
};

function uploadImage(file){
    var formData = new FormData();
    var vendorId = document.getElementById('vendorId').value;

    vendorId = "_"+vendorId+"_"

    var mimeType = file.type;
    var fileExtension = mimeTypeExtensions[mimeType] || '';

    var validFormat = true;
    if(fileExtension ===''){
        validFormat = false;
    }

    if(validFormat){
        var fileName = vendorId+fileExtension
        formData.append('file', file, fileName);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true)
        xhr.onload = function() {
            if (xhr.status === 200) {
            } else {
                alert("Failed. Ensure file is under 1MB");
            }
        };
        xhr.send(formData);

        updateURLOnDataBase(fileName)
    }else{
        alert("Please upload file in jpeg, png or gif format.");
    }


}

function updateURLOnDataBase(fileName){
    var vendorId = document.getElementById('vendorId').value;

    var requestBody = {
        imageUrl: fileName
    };

    fetch(`/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
        .then(response => {
            if (response.ok) {

            } else {
                throw new Error('Failed to update profile');
            }
        })
        .catch(error => {
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
})