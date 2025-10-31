import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Request, Response } from 'express';


@Controller('auth')
export class AuthController {


    constructor(private authservice: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string, password: string }) {

        return this.authservice.Login(body.email, body.password);
    }


    @Post('google')
    async googleLogin(@Body() body: { idToken: string }) {
        const { idToken } = body;
        if (!idToken) {
            throw new UnauthorizedException('Missing Google ID token');
        }

        // This will verify token, restrict domain, and issue JWT
        return await this.authservice.validateGoogleUser(idToken);
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        if (refreshToken) {
            // Revoke or delete refresh token server-side (optional but recommended)
            await this.authservice.revokeRefreshToken(refreshToken);
        }
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });
        return { message: 'Logged out successfully' };
    }
}