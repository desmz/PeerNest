export type TMetaData = {
  path: string;
  status: number;
  timestamp: string;
  [key: string]: unknown;
};

export type TApiError = {
  code: string;
  message: string;
  [key: string]: unknown;
};

export type TApiResponse<TData = unknown> = {
  success: true;
  data: TData;
  meta: TMetaData;
};

export type TApiErrorRes<TDetails = unknown> = {
  success: false;
  error: TApiError;
  details: TDetails;
  meta: TMetaData;
};
