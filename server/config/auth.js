const auth = {
  secretKey: process.env.JWT_SECRET || "nRtdxIt1QgT9VHjftlSvfbFYl55EZit1",
  tokenExpiry: process.env.TOKEN_EXPIRY || "24h"
};

module.exports = auth;
