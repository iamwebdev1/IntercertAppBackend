import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUserDto";


@Controller('users')
export class UserController{


    constructor(private userService : UserService){}

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto){

        const user= await this.userService.createUser(createUserDto);
        return {message : "User created successfully...",user}
    }

    


}