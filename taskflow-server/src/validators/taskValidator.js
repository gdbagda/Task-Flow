const validateBoard = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      errors.title = 'Board title is required';
    } else if (data.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters';
    } else if (data.title.trim().length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (data.description.trim().length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }
  }

  if (data.color !== undefined) {
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.color)) {
      errors.color = 'Color must be a valid hex value (e.g. #6366f1)';
    }
  }

  if (data.columns !== undefined) {
    if (!Array.isArray(data.columns)) {
      errors.columns = 'Columns must be an array';
    } else if (data.columns.length < 1) {
      errors.columns = 'Board must have at least 1 column';
    } else if (data.columns.length > 10) {
      errors.columns = 'Board cannot have more than 10 columns';
    } else {
      const invalid = data.columns.some(
        (col) => typeof col !== 'string' || col.trim().length < 1 || col.trim().length > 50
      );
      if (invalid) {
        errors.columns = 'Each column must be a non-empty string (max 50 chars)';
      }
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

const validateTask = (data, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      errors.title = 'Task title is required';
    } else if (data.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters';
    } else if (data.title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (data.description.trim().length > 2000) {
      errors.description = 'Description cannot exceed 2000 characters';
    }
  }

  if (!isUpdate || data.status !== undefined) {
    if (!isUpdate && (!data.status || typeof data.status !== 'string')) {
      errors.status = 'Task status is required';
    } else if (data.status !== undefined && typeof data.status !== 'string') {
      errors.status = 'Status must be a string';
    }
  }

  if (data.priority !== undefined) {
    const valid = ['low', 'medium', 'high', 'critical'];
    if (!valid.includes(data.priority)) {
      errors.priority = 'Priority must be one of: low, medium, high, critical';
    }
  }

  if (data.dueDate !== undefined && data.dueDate !== null) {
    const date = new Date(data.dueDate);
    if (isNaN(date.getTime())) {
      errors.dueDate = 'Due date must be a valid date';
    }
  }

  if (data.estimatedHours !== undefined && data.estimatedHours !== null) {
    const hours = Number(data.estimatedHours);
    if (isNaN(hours) || hours < 0) {
      errors.estimatedHours = 'Estimated hours must be a non-negative number';
    } else if (hours > 1000) {
      errors.estimatedHours = 'Estimated hours cannot exceed 1000';
    }
  }

  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.tags = 'Tags must be an array';
    } else if (data.tags.length > 10) {
      errors.tags = 'Cannot have more than 10 tags';
    } else {
      const invalid = data.tags.some(
        (tag) => typeof tag !== 'string' || tag.trim().length < 1 || tag.trim().length > 30
      );
      if (invalid) errors.tags = 'Each tag must be a non-empty string (max 30 chars)';
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

module.exports = { validateBoard, validateTask };