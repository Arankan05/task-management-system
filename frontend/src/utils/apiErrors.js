export const getApiErrorMessage = (error, fallback = "Request failed") => {
  const data = error?.response?.data;
  return data?.error?.message || data?.message || error?.message || fallback;
};

export const isUnauthorizedError = (error) => error?.response?.status === 401;

export const isForbiddenError = (error) => error?.response?.status === 403;
