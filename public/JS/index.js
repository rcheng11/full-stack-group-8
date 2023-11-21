document.addEventListener('DOMContentLoaded', function () {
    function setupLogoClick() {
        // Obtain logo using id
        const logoLink = document.getElementById('logo-link');

        // Event listener for logo-link
        logoLink.addEventListener('click', function () {
            this.classList.toggle('clicked');
        });
    }

    setupLogoClick();
});