import { Body, Controller, Post, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUserDto";
import { Roles } from "src/auth/Roles/roles.decorator";
import { RolesGuard } from "src/auth/Roles/roles.gaurd";
import { JwtAuthGuard } from "src/auth/Jwt/jwt-auth.gaurds";
import { AdminSetupDto } from "./dto/adminSetupDto";

@Controller()
export class UserController {


    constructor(private userService: UserService) { }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post('user/create-user')
    async createUser(@Body() dto: CreateUserDto, @Request() req) {
        return this.userService.createUser(dto);
    }

     @Post('setup/admin')
      async createAdmin(@Body() dto: AdminSetupDto) {
        return this.userService.createAdminIfNone(dto.name, dto.email, dto.password);
    }

}