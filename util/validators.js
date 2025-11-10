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

function validateTaskInput(taskData) {
  const { title, description, status } = taskData;

  // Allowed statuses
  const validStatuses = ["Pending", "In progress", "Completed"];

  // Validation checks
  const isValidTitle = title && title.trim().length >= 3;
  const isValidDescription = description && description.trim().length >= 5;
  const isValidStatus = status ? validStatuses.includes(status) : true;

  return isValidTitle && isValidDescription && isValidStatus;
}

module.exports = { validateSignupInput, validateLoginInput, validatePasswordInput, validateTaskInput };