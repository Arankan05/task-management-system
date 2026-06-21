const MIN_LENGTH = 8;

const validatePassword = (password) => {
  const errors = [];

  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required", errors: ["Password is required"] };
  }

  if (password.length < MIN_LENGTH) {
    errors.push(`at least ${MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("one number");
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("one special character");
  }

  if (errors.length) {
    return {
      valid: false,
      message: `Password must include ${errors.join(", ")}`,
      errors,
    };
  }

  return { valid: true, message: null, errors: [] };
};

const generateTempPassword = () => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];

  const base = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;
  while (base.length < 12) {
    base.push(pick(all));
  }

  return base.sort(() => Math.random() - 0.5).join("");
};

module.exports = {
  MIN_LENGTH,
  validatePassword,
  generateTempPassword,
};
