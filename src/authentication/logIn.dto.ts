import { IsString } from "class-validator";

class logInDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export default logInDto;
