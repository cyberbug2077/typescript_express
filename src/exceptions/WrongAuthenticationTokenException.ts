import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(400, "Wrong Authentication Token");
  }
}

export default WrongAuthenticationTokenException;
