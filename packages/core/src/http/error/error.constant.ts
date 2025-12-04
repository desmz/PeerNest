import { HttpErrorCode } from './http-response.type';

export const ErrorCodeToStatusMap: Record<HttpErrorCode, number> = {
  [HttpErrorCode.VALIDATION_ERROR]: 400,
  [HttpErrorCode.INVALID_CREDENTIALS]: 400,
  [HttpErrorCode.UNAUTHORIZED]: 401,
  [HttpErrorCode.UNAUTHORIZED_SHARE]: 401,
  [HttpErrorCode.FREEZE_ACCOUNT]: 403,
  [HttpErrorCode.RESTRICTED_RESOURCE]: 403,
  [HttpErrorCode.NOT_FOUND]: 404,
  [HttpErrorCode.CONFLICT]: 409,
  [HttpErrorCode.UNSUPPORTED_MIMETYPE]: 415,
  [HttpErrorCode.UNPROCESSABLE_ENTITY]: 422,
  [HttpErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [HttpErrorCode.DATABASE_CONNECTION_UNAVAILABLE]: 503,
  [HttpErrorCode.UNKNOWN_ERROR_CODE]: 500,
};
