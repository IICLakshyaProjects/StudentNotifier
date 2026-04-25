import jwt from "jsonwebtoken";

const {
  JWT_SECRET,
  JWT_EXPIRATION = "1h",
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRATION = "7d",
} = process.env;

if (!JWT_SECRET) throw new Error("Missing env var: JWT_SECRET");
if (!JWT_REFRESH_SECRET) throw new Error("Missing env var: JWT_REFRESH_SECRET");

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

