const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:5000/api/v1/users/updatePassword'
        : 'http://localhost:5000/api/v1/users/updateMe';

    const options = {
      method: 'PATCH',
      credentials: 'include', // Includes cookies in the request
    };

    // Don't set Content-Type for FormData (for file uploads)
    // The browser will set it automatically with the correct boundary
    if (data instanceof FormData) {
      options.body = data;
    } else {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    console.log(responseData);
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
    const form = new FormData(); //to get the file from the form
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]); //to get the file from the form
    // console.log(form.get('photo')); //to see the file name
    updateData(form, 'data');
  });
}
const passwordBtn = document.querySelector('.form-user-password');
if (passwordBtn) {
  passwordBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    //
    document.querySelector('.btn--save-password').textContent = 'Updating...'; // Change button text to "Updating..."
    const passwordCurrent = document.getElementById('current-password').value;
    const password = document.getElementById('new-password').value;
    const passwordConfirm = document.getElementById('confirm-password').value;
    // console.log(passwordCurrent, password, passwordConfirm);
    await updateData(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    // Clear the password fields after submission
    document.querySelector('.btn--save-password').textContent = 'Save Password'; // Change button text to "Updating..."
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
  });
}
