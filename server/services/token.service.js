const jwt = require('jsonwebtoken');

const tokenModel = require('../models/token.model');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  validateToken(token, secret) {
    try {
      const userData = jwt.verify(token, secret);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateAccessToken(token) {
    return this.validateToken(token, process.env.JWT_ACCESS_SECRET);
  }

  validateRefreshToken(token) {
    return this.validateToken(token, process.env.JWT_REFRESH_SECRET);
  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }

  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    const token = await tokenModel.create({ user: userId, refreshToken });

    return token;
  }
}

module.exports = new TokenService();
