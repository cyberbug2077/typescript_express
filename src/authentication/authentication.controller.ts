import * as bcrypt from "bcrypt";
import * as express from "express";
import Controller from "../interfaces/controller.interface";
import userModel from "../users/user.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../users/user.dto";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import logInDto from "./logIn.dto";

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = express.Router();
  public user = userModel;

  constructor() {
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.resgistration
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(logInDto),
      this.loggingIn
    );
  }

  private resgistration = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = request.body;
    if (await this.user.findOne({ email: userData.email })) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const password = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password,
      });

      user.password = undefined;
      response.send(user);
    }
  };

  private loggingIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const logInData: logInDto = request.body;
    const user = await this.user.findOne({ email: logInData.email });
    if (user) {
      const isPssswordMatching = await bcrypt.compare(
        logInData.password,
        user.password
      );
      if (isPssswordMatching) {
        user.password = undefined;
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };
}

export default AuthenticationController;
