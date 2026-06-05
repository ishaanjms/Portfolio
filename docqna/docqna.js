(function () {
  const ACCESS_CODE = 'docqna';

  const form = document.querySelector('.dq-password-form');
  const input = document.querySelector('#case-password');
  const error = document.querySelector('.password-error');
  const protectedContent = document.querySelector('.dq-protected-content');

  function unlockCase() {
    document.body.classList.add('case-unlocked');
    protectedContent.hidden = false;
    error.textContent = '';
    protectedContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim().toLowerCase();

    if (value === ACCESS_CODE) {
      unlockCase();
      return;
    }

    error.textContent = 'Incorrect password. Please check the access code and try again.';
    input.select();
  });
})();
