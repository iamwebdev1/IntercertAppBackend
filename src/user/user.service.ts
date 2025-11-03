import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/createUserDto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 🔍 Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // 🧠 Check if admin exists
  async findAdminExists(): Promise<boolean> {
    const admin = await this.userRepository.findOne({
      where: { userRole: UserRole.ADMIN },
    });
    return !!admin;
  }

  // 👑 Create admin if none exists
  async createAdminIfNone(name: string, email: string, password: string): Promise<User> {
    const adminExists = await this.findAdminExists();
    if (adminExists) {
      throw new ConflictException('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      userRole: UserRole.ADMIN,
    });

    try {
      return await this.userRepository.save(admin);
    } catch (err) {
      throw new InternalServerErrorException('Could not create admin');
    }
  }

  // 👤 Create a regular user
  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      userRole: dto.role ?? UserRole.USER,
    });

    return this.userRepository.save(user);
  }

  // 🔐 Validate user credentials (for AuthService)
  async validateUserByEmailPassword(email: string, plainPassword: string): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(plainPassword, user.password);
    if (!isValid) return null;

    // Exclude password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
