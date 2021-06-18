const ApiError = require('../exceptions/api-error');

const tokenService = require('../services/token.service');

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(ApiError.UnauthorizerdError());
    }

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizerdError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizerdError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizerdError());
  }
};
