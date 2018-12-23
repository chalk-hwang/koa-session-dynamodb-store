import Server from './server';

const server = new Server();

export const handler = server.serverless();
