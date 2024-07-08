document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display user profile data
    fetch('profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                window.location.href = 'login.html';
            } else {
                document.getElementById('name').value = data.name;
                document.getElementById('email').value = data.email;
            }
        });

    // Handle profile update form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        fetch('profile.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.success);
            } else {
                alert('Failed to update profile');
            }
        });
    });

    // Handle logout button click
    document.getElementById('logout-btn').addEventListener('click', function() {
        fetch('logout.php')
            .then(() => {
                window.location.href = 'login.html';
            });
    });
});
