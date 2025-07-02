import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, type IProvider } from './user.entity';
import { Repository } from 'typeorm';
import { CryptoHelper } from 'src/common/helpers/crypto.helper';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cryptoHelper: CryptoHelper,
    private readonly emailService: EmailService,
  ) {}

  public create = async (user: Partial<User>): Promise<User> => {
    const { iv, encryptedText } = this.cryptoHelper.encrypt(user.email!);
    const hashedEmail = this.cryptoHelper.hash(user.email!);

    const userEntity = this.userRepository.create({
      ...user,
      iv,
      email: encryptedText,
      emailHash: hashedEmail,
    });

    const createdUser: User = await this.userRepository.save(userEntity);
    this.logger.log(`User with email ${user.email} created`);
    return createdUser;
  };

  public updateUser = async (
    id: string,
    updateUserDto: Partial<User>,
  ): Promise<User> => {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.error(`User with id ${id} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const { iv, encryptedText } = this.cryptoHelper.encrypt(
        updateUserDto.email,
      );
      const hashedEmail = this.cryptoHelper.hash(updateUserDto.email);

      user.iv = iv;
      user.email = encryptedText;
      user.emailHash = hashedEmail;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...rest } = updateUserDto;
    Object.assign(user, rest);

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`User with id ${id} updated`);

    return updatedUser;
  };

  public changePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> => {
    const user = await this.findyById(userId);

    if (!user) {
      this.logger.error(`User with id ${userId} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (newPassword === oldPassword) {
      this.logger.error(
        `New password is the same as the old one for user with id ${userId}`,
      );
      throw new HttpException(
        'New password is the same as the old one',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      this.logger.error(`Invalid password for user with id ${userId}`);
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    user.password = newPassword;
    await this.userRepository.save(user);
    this.logger.log(`Password changed for user with id ${userId}`);
  };

  public verifyUser = async (email: string): Promise<void> => {
    const user = await this.findByEmail(email);

    if (!user) {
      this.logger.error(`User with email ${email} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.isVerified) {
      this.logger.error(`User with email ${email} already verified`);
      throw new HttpException('User already verified', HttpStatus.BAD_REQUEST);
    }

    user.isVerified = true;
    await this.userRepository.save(user);
    this.logger.log(`User with email ${email} verified`);
  };

  public findByEmail = async (email: string): Promise<User | null | void> => {
    const emailHash = this.getEmailHashed(email);
    const user = await this.userRepository.findOne({ where: { emailHash } });

    if (!user) return this.logger.error(`User with email ${email} not found`);

    this.logger.log(`User with email ${email} found`);
    return user;
  };

  public findyById = async (id: string): Promise<User | null | void> => {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) return this.logger.error(`User with id ${id} not found`);

    this.logger.log(`User wtih id ${id} found`);
    return user;
  };

  public resetPassword = async (
    email: string,
    password: string,
  ): Promise<void> => {
    const user = await this.findByEmail(email);

    if (!user) {
      this.logger.error(`User with email ${email} not found`);
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.password = password;
    await this.userRepository.save(user);
    this.logger.log(`Password reset for user with email ${email}`);
  };

  public getUserByProviderAndEmail = async (
    provider: IProvider,
    email: string,
  ): Promise<User | null> => {
    const emailHash = this.getEmailHashed(email);
    return this.userRepository.findOne({ where: { provider, emailHash } });
  };

  private getEmailHashed = (email: string): string =>
    this.cryptoHelper.hash(email);
}
