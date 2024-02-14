import HttpException from "./HttpException";

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(400, "missing authentication token");
  }
}

export default AuthenticationTokenMissingException;
