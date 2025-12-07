//main javascript file - runs when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    //auto-dismiss alerts after 5 seconds
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            //use bootstrap's alert component to close
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    //add bootstrap validation styling to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            //check form validity
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            //add was-validated class for bootstrap styling
            form.classList.add('was-validated');
        }, false);
    });
});