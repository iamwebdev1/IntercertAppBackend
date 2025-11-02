import { RefreshToken } from "src/auth/auth.enity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";





@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: "user" }) // "admin" or "user"
  userType: string;



  // @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
  //   cascade: true, // optional: automatically save refresh tokens when user is saved
  // })
  // refreshTokens: RefreshToken[];


}