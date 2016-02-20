import request from 'superagent';
import emailValidator from 'email-validator';

const signupForms = document.querySelectorAll('.signup-form');
const signupFormsArr = Array.prototype.slice.call(signupForms);
signupFormsArr.map(s => setupSignupForm(s, signupFormsArr));

function setupSignupForm(signupForm, signupForms) {
  const submitBtn = signupForm.querySelector('.submit');
  const emailField = signupForm.querySelector('.email');
  const signup = (email, done) => request
          .post('signup')
          .send({ email })
          .end(done);

  submitBtn.addEventListener('click', (ev) => {
    ev.preventDefault();

    if (!emailValidator.validate(emailField.value)) {
      emailField.focus();
      signupForms.map(s => signupFormState(s, 'invalid-email'));

      return;
    }

    signupForms.map(s => signupFormState(s, 'signing-up'));

    signup(emailField.value, (err, res) => {
      if (err) {
        signupForms.map(s => signupFormState(s, 'error'));
      }

      if (res.body.status == 'signed-up') {
        signupForms.map(s => signupFormState(s, 'signed-up'));
      }

      if (res.body.status == 'already-signed-up') {
        signupForms.map(s => signupFormState(s, 'already-signed-up'));
      }
    });
  });
}

function signupFormState(signupForm, state) {
  signupForm.className = 'signup-form';
  signupForm.offsetWidth;
  signupForm.className = `signup-form signup-form--${state}`;
}
