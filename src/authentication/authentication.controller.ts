import * as bcrypt from "bcrypt";
import * as express from "express";
import Controller from "../interfaces/controller.interface";
import userModel from "../users/user.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../users/user.dto";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import logInDto from "./logIn.dto";
import User from "../users/user.interface";
import TokenData from "../interfaces/tokenData.interface";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import * as jwt from "jsonwebtoken";

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
    this.router.post(`${this.path}/logout`, this.loggingOut);
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
      const tokenData = this.createToken(user);
      response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
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
        const tokenData = this.createToken(user);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private loggingOut = (
    requset: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    response.setHeader("Set-Cookie", [`Authorization=;Max-age=0`]);
    response.send(200);
  };

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }
}

export default AuthenticationController;
