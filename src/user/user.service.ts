import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./dto/createUserDto";



@Injectable()
export class UserService {


    constructor(@InjectRepository(User)
    private userRepository: Repository<User>) { }

    async createUser(createUserDto: CreateUserDto) {
        const { name, email, password } = createUserDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException("Email already exists");
        }
        const hashpassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({ name, email, password: hashpassword });
        return this.userRepository.save(user);
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } });
    }



}