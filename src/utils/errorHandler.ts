type ApiErrorPayload = {
  message?: string;
  error?: string;
  details?: string;
};

type ApiErrorLike = {
  response?: {
    status?: number;
    data?: ApiErrorPayload;
  };
  request?: unknown;
  message?: string;
  code?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Unexpected error occurred. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Unable to connect to server. Please try again later.';

// Only 401 means unauthenticated/expired session. 403 is authorization and should not force logout.
export const AUTH_ERROR_STATUSES = new Set([401]);

export const isAuthErrorStatus = (status?: number): boolean => {
  return status !== undefined && AUTH_ERROR_STATUSES.has(status);
};

export const getErrorMessage = (error: unknown, fallbackMessage?: string): string => {
  const err = error as ApiErrorLike | undefined;
  const status = err?.response?.status;

  if (isAuthErrorStatus(status)) {
    return 'Please login to continue';
  }

  if (err?.code === 'ERR_NETWORK' || (!err?.response && !!err?.request)) {
    return NETWORK_ERROR_MESSAGE;
  }

  const backendMessage = err?.response?.data?.message || err?.response?.data?.error || err?.response?.data?.details;
  if (backendMessage && backendMessage.trim().length > 0) {
    return backendMessage;
  }

  if (err?.message && err.message.trim().length > 0) {
    return err.message;
  }

  return fallbackMessage || DEFAULT_ERROR_MESSAGE;
};

export const getThunkErrorMessage = (
  action: { payload?: unknown; error?: { message?: string } },
  fallbackMessage: string
): string => {
  if (typeof action.payload === 'string' && action.payload.trim().length > 0) {
    return action.payload;
  }
  if (action.error?.message && action.error.message.trim().length > 0) {
    return action.error.message;
  }
  return fallbackMessage;
};
