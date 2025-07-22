const database = require('./database');
const auth = require('./auth');
const email = require('./email');
const server = require('./server');

module.exports = {
  database,
  auth,
  email,
  server,
  
  // Legacy support - maintaining backward compatibility
  dbHost: database.host,
  dbUser: database.user,
  dbPassword: database.password,
  dbName: database.database,
  secretKey: auth.secretKey,
  emailUser: email.user,
  emailPass: email.password
};
