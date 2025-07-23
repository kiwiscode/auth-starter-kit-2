const getEnv = (key, defaultValue) => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

const PORT = getEnv("PORT", "3000");
const NODE_ENV = getEnv("NODE_ENV", "development");
const MONGO_URI = getEnv("MONGO_URI");
const JWT_ACCESS_SECRET = getEnv("JWT_ACCESS_SECRET");
const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
const FRONTEND_URL = getEnv("FRONTEND_URL");
const EMAIL_SENDER = getEnv("EMAIL_SENDER");
const RESEND_API_KEY = getEnv("RESEND_API_KEY");
const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
const GOOGLE_CALLBACK_URL = getEnv("GOOGLE_CALLBACK_URL");

module.exports = {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  FRONTEND_URL,
  EMAIL_SENDER,
  RESEND_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
};
