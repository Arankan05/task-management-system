const ACCOUNT_STATUS = {
  ACTIVE: "ACTIVE",
  PENDING_PASSWORD_CHANGE: "PENDING_PASSWORD_CHANGE",
};

const needsPasswordChange = (user) =>
  user?.accountStatus === ACCOUNT_STATUS.PENDING_PASSWORD_CHANGE
  || user?.isTemporaryPassword === true
  || user?.mustResetPassword === true;

const isTemporaryPasswordExpired = (user) =>
  needsPasswordChange(user)
  && user?.temporaryPasswordExpiresAt
  && new Date() > new Date(user.temporaryPasswordExpiresAt);

const buildTempPasswordCreateData = (hashedPassword, expiresAt) => ({
  password: hashedPassword,
  isTemporaryPassword: true,
  mustResetPassword: true,
  accountStatus: ACCOUNT_STATUS.PENDING_PASSWORD_CHANGE,
  temporaryPasswordExpiresAt: expiresAt,
});

const buildPasswordChangedData = (hashedPassword) => ({
  password: hashedPassword,
  isTemporaryPassword: false,
  mustResetPassword: false,
  accountStatus: ACCOUNT_STATUS.ACTIVE,
  temporaryPasswordExpiresAt: null,
  passwordChangedAt: new Date(),
});

const withClientPasswordFlags = (user) => {
  if (!user) return user;
  return {
    ...user,
    mustResetPassword: needsPasswordChange(user),
  };
};

module.exports = {
  ACCOUNT_STATUS,
  needsPasswordChange,
  isTemporaryPasswordExpired,
  buildTempPasswordCreateData,
  buildPasswordChangedData,
  withClientPasswordFlags,
};
