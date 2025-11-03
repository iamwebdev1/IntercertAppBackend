import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import * as bcrypt from 'bcrypt';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OAuth2Client } from "google-auth-library";
import { RefreshToken } from "./auth.enity";

@Injectable()
export class AuthService {
    private googleClient = new OAuth2Client(
        '1013646318751-gcqtdrjunfmbbjsku8l8uo2vqclcqe4f.apps.googleusercontent.com'
    );

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
    ) { }

    // ✅ Google Login Handler
    async validateGoogleUser(idToken: string) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: '1013646318751-gcqtdrjunfmbbjsku8l8uo2vqclcqe4f.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new UnauthorizedException('Invalid Google token');
        }

        const email = payload.email?.toLowerCase() || '';
        if (!email.endsWith('@intercert.com')) {
            throw new UnauthorizedException('Only @intercert.com accounts allowed');
        }
        let user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const jwtPayload = { sub: user.id, email: user.email, userRole: user.userRole };
        const token = await this.jwtService.signAsync(jwtPayload, {
            secret: 'intercert-secret-key',
            expiresIn: '1d',
        });


        return {
            message: 'Google login successful',
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    // ✅ Logout handler — revoke refresh token if present
    async revokeRefreshToken(token: string) {
        await this.refreshTokenRepo.delete({ token });
    }

    // ✅ Normal email-password login
    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        // ✅ Generate JWT with same secret as JwtStrategy
        const payload = { sub: user.id, email: user.email, userRole: user.userRole };
        console.log('JWT Payload:', payload);
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: 'intercert-secret-key', // ✅ MUST MATCH JwtStrategy secret
            expiresIn: '1d',
        });

        return {
            message: 'Login successful',
            access_token: accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    // ✅ Helper for JwtStrategy
    async validateUser(email: string) {
        return this.userService.findByEmail(email);
    }
}
