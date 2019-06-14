function buildMockApiFailure(message, code, statusCode) {
  return {
    status: statusCode,
    data: {
      status: false,
      data: {
        errors: [message,],
      },
      code,
      type: 'ClientError',
    },
  };
}


export const Timeout = buildMockApiFailure('Request timed out.', 'ERR408', 408);
export const Unauthorized = buildMockApiFailure('Your session has expired. Please Login again.', 'ERR401', 401);
export const InternalServerError = buildMockApiFailure('The server encountered some error.', 'ERR500', 500);
export const SomeError = buildMockApiFailure('Unexpected Error.', 'ERR500', 500);
