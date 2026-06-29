const validateRegister = (data) => {
  const errors = {};

  // Name
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }

  // Email
  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  // Password
  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (data.password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateLogin = (data) => {
  const errors = {};

  if (!data.email || typeof data.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateProfileUpdate = (data) => {
  const errors = {};

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (data.name.trim().length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
  }

  if (data.currentPassword !== undefined || data.newPassword !== undefined) {
    if (!data.currentPassword) {
      errors.currentPassword = 'Current password is required to set a new password';
    }
    if (!data.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    } else if (data.newPassword.length > 128) {
      errors.newPassword = 'New password cannot exceed 128 characters';
    }
    if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = { validateRegister, validateLogin, validateProfileUpdate };