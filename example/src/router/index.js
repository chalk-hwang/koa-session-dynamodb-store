import Router from 'koa-router';

const router = new Router();

router.get('/', (ctx) => {
  console.log('avoiding cold start...');
  ctx.body = {
    view: ctx.session.views,
    env: process.env.NODE_ENV,
  };
});

export default router;
