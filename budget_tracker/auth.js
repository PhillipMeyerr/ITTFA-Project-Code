document.addEventListener('DOMContentLoaded', function() {
    fetch('session_check.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                alert('You need to log in to access this page');
                window.location.href = 'login.html';
            }
        });
});
