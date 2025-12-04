/* eslint-disable @typescript-eslint/naming-convention */

export type THttpError = {
  /** a human-readable explanation specific to this occurrence of the problem. */
  message: string;
  /** the HTTP status code applicable to this problem, expressed as a string value. */
  status: number;
  /** an application-specific error code, expressed as a string value. */
  code: string;
  /** additional data and detail */
  data?: unknown;
};

export enum HttpErrorCode {
  // 400 - The request body does not match the schema for the expected parameters
  VALIDATION_ERROR = 'validation_error',
  // 400 - The credentials is invalid.
  INVALID_CREDENTIALS = 'invalid_credentials',
  // 401 - The bearer token is not valid.
  UNAUTHORIZED = 'unauthorized',
  // 401 - Given the bearer token used, the client doesn't have permission to perform this operation.
  UNAUTHORIZED_SHARE = 'unauthorized_share',
  // 403 - The client does not have permission to perform this operation because the client might already be deactivated or deleted.
  FREEZE_ACCOUNT = 'freeze_account',
  // 403 - Given the bearer token used, the client doesn't have permission to perform this operation.
  RESTRICTED_RESOURCE = 'restricted_resource',
  // 404 - Given the bearer token used, the resource does not exist.
  NOT_FOUND = 'not_found',
  // 409 - The request could not be completed due to a conflict with the current state of the resource.
  CONFLICT = 'conflict',
  // 415 - The request payload contains an unsupported mime type or extension even though the content type header is correct.
  UNSUPPORTED_MIMETYPE = 'unsupported_mimetype',
  // 422 - The request was well-formed but was unable to be followed due to semantic errors, such as a missing parameter, as well as the server refusing to process the request because it violates the business logic.
  UNPROCESSABLE_ENTITY = 'unprocessable_entity',
  // 500 - An unexpected error occurred.
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  // 503 - database is unavailable or is not in a state that can be queried.  Please try again later.
  DATABASE_CONNECTION_UNAVAILABLE = 'database_connection_unavailable',
  // Unknown error code
  UNKNOWN_ERROR_CODE = 'unknown_error_code',
}
