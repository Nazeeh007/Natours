const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};
const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
      credentials: 'include', // Includes cookies in the request
    });

    const data = await response.json();
    if (data.status === 'success') {
      console.log(data);
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      // return data;
    } else {
      showAlert('error', data.message || 'Login failed. Please try again.');
    }
  } catch (err) {
    // Since fetch doesn't reject on HTTP error status
    // We need to handle error responses differently
    if (err.name === 'TypeError') {
      showAlert('error', 'Network error. Please try again.');
    } else {
      showAlert('error', err.message || 'An error occurred during login');
    }
  }
};

const sumbitBtn = document.querySelector('.form--login');

if (sumbitBtn) {
  sumbitBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // console.log(email, password);
    try {
      const data = await login(email, password);
      if (data.status === 'success') {
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      }
    } catch (error) {
      console.log(error);
    }
  });
}
