require('dotenv').config();
const Server = require('./server').default;

const server = new Server();
server.listen(4000);
