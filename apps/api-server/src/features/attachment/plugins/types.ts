export type TPresignParams = {
  contentType: string;
  contentLength: number;
  fileName: string;
  expiresIn?: number;
};

export type TPresignRes = {
  path: string;
  url: string;
  uploadMethod: string;
  requestHeaders: Record<string, unknown>;
};

export type TObjectMeta = {
  size: number;
  mimetype: string;
  url: string;
  width?: number;
  height?: number;
};

export type TRespHeaders = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
