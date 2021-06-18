const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

const UserDto = require('../dtos/user.dto');
const UserModel = require('../models/user.model');

const mailService = require('./mail.service');
const tokenService = require('./token.service');

const ApiError = require('../exceptions/api-error');

class UserService {
  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest('Incorrect activation link');
    }

    user.isActivated = true;
    await user.save();
  }

  async issueTokenPair(user) {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest(`User with email ${email} doesn't exist`);
    }

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      throw ApiError.BadRequest(`Wrong password`);
    }

    const tokenPair = await this.issueTokenPair(user);
    return tokenPair;
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async registration(email, password) {
    const guest = await UserModel.findOne({ email });
    if (guest) {
      throw ApiError.BadRequest(`User with email ${email} already exist`);
    }

    const hashedPassword = await bcrypt.hash(password, 4);
    const activationLink = uuid();
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      activationLink,
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );

    const tokenPair = await this.issueTokenPair(user);
    return tokenPair;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizerdError();
    }

    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDB = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDB) {
      throw ApiError.UnauthorizerdError();
    }

    const user = await UserModel.findById(userData.id);
    const tokenPair = await this.issueTokenPair(user);
    return tokenPair;
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new UserService();
