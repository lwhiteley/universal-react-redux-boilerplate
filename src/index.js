import Koa from 'koa'
import connection from './server/models';
import api from './api'
import _ from 'lodash'
var jwt = require('koa-jwt');
var KoaRouter = require('koa-router');
var Router = require('koa-oai-mongoose/dist/mongoose').default;
var koaRouter = new KoaRouter();
var bodyParser = require('koa-bodyparser');
var logger = require('koa-logger');

const server = new Koa()

const opt = {
  apiDoc: './api.yaml',
  controllerDir: './src/server/controller',
  port: 3000,
  versioning: true,
  mongo: connection,
  modelConfig:{
    user: {
      hiddenFields: ['bornAt']
    }
  }
};

if (__DEV__) {
  const webpack = require('../webpack.server').default
  webpack(server)
} else {
  const serve = require('koa-static')
  server.use(serve('dist'))
}

process.env.__DEBUG__ = true

server.use(api)

var router = new Router(opt);
// Custom 401 handling if you don't want to expose koa-jwt errors to users
server.use(function(ctx, next){
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  });
});

server.use(logger());
server.use(bodyParser());

server.use(
  jwt({ secret: 'shared-secret' })
  .unless({ 
    path: [
      /^\/(public|favicon|api-explorer|koa-oai-router)/,
      /user\/auth$/
    ] 
  })
);


server.use((ctx, next) => {
    if(ctx.request.method === 'POST' && ctx.state.user){
      const ownerId = ctx.state.user._id;
      delete ctx.request.body.ownerId
      if(_.isArray(ctx.request.body)){
        ctx.request.body = ctx.request.body.map((item) => {
          item.ownerId = ownerId;
          return item;
        })
      }else{
        ctx.request.body.ownerId = ownerId;
      }
    }
    return next();
  });

server.use(router.routes());
server.use(router.apiExplorer());

server.use(async ctx => {
  // Dynamic require enables hot reloading on the server
  const { render } = require('./server')
  const { status, redirect, body } = await render(ctx.url)

  ctx.status = status

  if (redirect) {
    ctx.redirect(redirect)
  } else {
    ctx.body = body
  }
})

export default server
