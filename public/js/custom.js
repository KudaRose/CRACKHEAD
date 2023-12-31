const loginBtn = document.getElementById("login-btn");
const openLoginModal = function() {
    const loginModal = document.querySelector("#login-modal");
    loginModal.classList.add('active');
}

loginBtn.addEventListener('click', openLoginModal);


function openWarningModal() {
    const warningModal = document.getElementById('warning-modal');
    warningModal.style.display = 'block';
}

function closeWarningModal() {
    const warningModal = document.getElementById('warning-modal');
    warningModal.style.display = 'none';
}

const openRegisterModal = function() {
    const registerModal = document.querySelector("#register-modal");
    registerModal.classList.add('active');
}
const registerBtn = document.getElementById("register-btn");

registerBtn.addEventListener('click', openRegisterModal);
