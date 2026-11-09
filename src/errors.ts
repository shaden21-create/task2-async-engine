export class HttpError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
    statusText: string,
  ) {
    super(`HTTP ${status} ${statusText} for ${url}`);
    this.name = "HttpError";
  }
}

export class PayloadError extends Error {
  constructor(
    readonly url: string,
    message: string,
  ) {
    super(`${message} (${url})`);
    this.name = "PayloadError";
  }
}