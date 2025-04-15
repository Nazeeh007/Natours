const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:5000/api/v1/users/updatePassword'
        : 'http://localhost:5000/api/v1/users/updateMe';

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), //fetch use body not data
      credentials: 'include', // Includes cookies in the request
    });

    const responseData = await response.json();

    if (responseData.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    } else {
      showAlert('error', responseData.message);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error updating data! Try again.');
  }
};

const saveBtn = document.querySelector('.form-user-data');
if (saveBtn) {
  saveBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    console.log(name, email);
    updateData({ name, email }, 'data');
  });
}
const passwordBtn = document.querySelector('.form-user-password');
if (passwordBtn) {
  passwordBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    //
    document.querySelector('.btn--save-password').textContent = 'Updating...'; // Change button text to "Updating..."
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // console.log(passwordCurrent, password, passwordConfirm);
    await updateData(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    // Clear the password fields after submission
    document.querySelector('.btn--save-password').textContent = 'Save Password'; // Change button text to "Updating..."
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
