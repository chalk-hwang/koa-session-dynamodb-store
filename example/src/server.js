import Koa from 'koa';
import serverless from 'serverless-http';
import koaBody from 'koa-body';
import koaLogger from 'koa-logger';
import koaSession from 'koa-session';
import router from './router';
import DynamoDBStore from '../../dist/DynamoDBStore';

export default class Server {
  constructor() {
    this.app = new Koa();
    this.middleware();
  }

  middleware() {
    const { app } = this;

    app.keys = [process.env.SECRET_KEY];
    const dynamoDBStoreOptions = {
      table: {
        name: process.env.SESSION_DYNAMODB_TABLE,
        useTtlExpired: true,
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
      dynamoConfig: {},
    };
    if (process.env.NODE_ENV === 'development') {
      dynamoDBStoreOptions.dynamoConfig = {
        region: 'local',
        endpoint: 'http://localhost:8000',
        accessKeyId: 'dummyKey',
        secretAccessKey: 'dummyKey',
      };
    }

    app.use(
      koaSession(
        {
          store: new DynamoDBStore(dynamoDBStoreOptions),
        },
        app,
      ),
    );
    app.use(koaLogger());
    app.use(
      koaBody({
        multipart: true,
      }),
    );
    app.use((ctx, next) => {
      // ignore favicon
      if (ctx.path === '/favicon.ico') return;

      let n = ctx.session.views || 0;
      ctx.session.views = ++n;
      next();
    });
    app.use(router.routes()).use(router.allowedMethods());
  }

  listen(port) {
    const { app } = this;
    app.listen(port);
    console.log('Listening to port', port);
  }

  serverless() {
    const { app } = this;
    return serverless(app);
  }
}
