// @flow

// defaults
export const DEFAULT_TABLE_NAME: string = 'sessions';
export const DEFAULT_HASH_KEY: string = 'sessionId';
export const DEFAULT_TTL_KEY: string = 'expires';
export const DEFAULT_USE_TTL_EXPIRED: boolean = true;
export const DEFAULT_RCU: number = 5;
export const DEFAULT_WCU: number = 5;
export const DEFAULT_TTL: number = 86400000; // 1 day
export const DEFAULT_CALLBACK = (err: Error) => {
  if (err) {
    throw err;
  }
};

// aws
export const API_VERSION: string = '2012-08-10';
