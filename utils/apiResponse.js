export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors) response.errors = errors;
  
  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, pagination) => {
  return res.json({
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString()
  });
};

export constCreatedResponse = (res, data, message = 'Resource created') => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const notFoundResponse = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  CreatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse
};