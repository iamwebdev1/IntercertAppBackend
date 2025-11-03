import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./Jwt/jwt.strategy";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { RefreshToken } from "./auth.enity";


@Module({
    imports: [TypeOrmModule.forFeature([User, RefreshToken]), UserModule, PassportModule, JwtModule.register({
        secret: 'intercert-secret-key',
        signOptions: { expiresIn: '1d' }
    })],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],

})


export class AuthModule {

}