const server = {
  port: process.env.PORT || 4000,
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development"
};

module.exports = server;
