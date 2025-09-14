function validateSignupInput(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const isValidName = data.name && data.name.length >= 3;
    const isValidEmail = data.email && emailRegex.test(data.email);
    const isValidPassword = data.password && strongPasswordRegex.test(data.password);

    return isValidName && isValidEmail && isValidPassword;
}

function validateLoginInput(data) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidEmail = data.email && emailRegex.test(data.email);
  const isValidPassword = data.password && data.password.length >= 6;

  return isValidEmail && isValidPassword;
}

function validatePasswordInput(password) {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const isValidPassword = password && strongPasswordRegex.test(password);

  return isValidPassword;
}

module.exports = { validateSignupInput, validateLoginInput, validatePasswordInput };