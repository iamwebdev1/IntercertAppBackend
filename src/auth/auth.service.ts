import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshToken } from "./auth.enity";
import { OAuth2Client } from "google-auth-library";


@Injectable()
export class AuthService {

    private client = new OAuth2Client('1013646318751-gcqtdrjunfmbbjsku8l8uo2vqclcqe4f.apps.googleusercontent.com');

    constructor(private userService: UserService,
        private jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private refreshTokenRepo: Repository<RefreshToken>,
    ) { }



    async validateGoogleUser(idToken: string) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: '1013646318751-gcqtdrjunfmbbjsku8l8uo2vqclcqe4f.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        if (!payload) throw new UnauthorizedException('Invalid Google token');

        const email: string = payload.email || '';
        if (!email.toLowerCase().endsWith('@intercert.com')) {
            throw new UnauthorizedException('Only @intercert.com accounts allowed');
        }



        // Optional: return JWT token to frontend
        const token = this.jwtService.sign({ email, name: payload.name });
        return { token, email, name: payload.name };
    }

    async revokeRefreshToken(token: string) {
        // Example: remove the refresh token row from DB
        await this.refreshTokenRepo.delete({ token });
    }

    async Login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException("User not Found");

        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid Password");
        }

        //jwt token process
        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload);

        return {
            message: "Login Successfully",
            access_tocken: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }
    }

    async validateUser(email: string) {
        return this.userService.findByEmail(email);
    }

}