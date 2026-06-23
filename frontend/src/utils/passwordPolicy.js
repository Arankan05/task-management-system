export const PASSWORD_REQUIREMENTS =
  'At least 8 characters with uppercase, lowercase, number, and special character'

export const validatePasswordClient = (password) => {
  const errors = []
  if (!password || password.length < 8) errors.push('at least 8 characters')
  if (!/[A-Z]/.test(password || '')) errors.push('one uppercase letter')
  if (!/[a-z]/.test(password || '')) errors.push('one lowercase letter')
  if (!/[0-9]/.test(password || '')) errors.push('one number')
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || '')) errors.push('one special character')
  if (errors.length) {
    return { valid: false, message: `Password must include ${errors.join(', ')}` }
  }
  return { valid: true, message: null }
}
