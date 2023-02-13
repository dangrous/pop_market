const app = require('./app'); // the actual Express application
const http = require('http');
const config = require('./utils/config');
const logger = require('./utils/logger');

const server = http.createServer(app);

server.listen(8080, '0.0.0.0', () => {
  logger.info(`Server running on port ${config.PORT}`);
});
