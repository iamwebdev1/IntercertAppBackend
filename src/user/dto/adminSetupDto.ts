import { IsEmail, IsNotEmpty } from 'class-validator';

export class AdminSetupDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
