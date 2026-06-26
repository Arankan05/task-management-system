const ACCESS_COOKIE = "token";
const REFRESH_COOKIE = "refreshToken";

const isProduction = process.env.NODE_ENV === "production" || (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost"));

const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
});

const getAccessCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: 15 * 60 * 1000,
});

const getRefreshCookieOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: Number(process.env.JWT_REFRESH_DAYS || 7) * 24 * 60 * 60 * 1000,
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE, accessToken, getAccessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());
};

const clearAuthCookies = (res) => {
  const opts = getBaseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
};

const getTokenFromRequest = (req) => {
  if (req.cookies?.[ACCESS_COOKIE]) {
    return req.cookies[ACCESS_COOKIE];
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

const getRefreshTokenFromRequest = (req) =>
  req.cookies?.[REFRESH_COOKIE] || null;

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
  getTokenFromRequest,
  getRefreshTokenFromRequest,
};
