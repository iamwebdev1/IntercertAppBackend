import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from "../user.entity";


export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Matches(/^[\w.%+-]+@intercert\.com$/, {
    message: 'Email must be a valid @intercert.com address',
  })
  email:string; 

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
