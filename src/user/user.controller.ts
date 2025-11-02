import { Body, Controller, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUserDto";
import * as bcrypt from 'bcrypt';
import { Roles } from "src/auth/Roles/roles.decorator";
import { RolesGuard } from "src/auth/Roles/roles.gaurd";
import { JwtAuthGuard } from "src/auth/Jwt/jwt-auth.gaurds";

@Controller('users')
export class UserController {


    constructor(private userService: UserService) { }

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {

        console.log('Received DTO:', createUserDto);

        const existingUsers = await this.userService.findAll();
        console.log("existing User",existingUsers);
        
        if (existingUsers.length === 0) {
            const newUser = await this.userService.createUser({
                ...createUserDto,
                userType: 'admin'
            });
            return { message: 'Admin created', user: newUser };
        }



        throw new UnauthorizedException('Signup disabled. Only admin can create new users.');
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post('create-user')
    async createUser(@Body() createUserDto: CreateUserDto) {
        const hashed = await bcrypt.hash(createUserDto.password, 10);
        const newUser = await this.userService.createUser({
            ...createUserDto,
            password: hashed,
            userType: 'user'
        });
        return { message: 'User created successfully', user: newUser };
    }





}