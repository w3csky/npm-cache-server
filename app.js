/*
 @fileOverview npm 缓存服务
*/
const fs = require('fs');
const path = require('path');

const app = require('koa')();
const koaBody = require('koa-body');
const router = require('koa-router')();


const middleware = require('./libs/middleware');//中间件
const config = require('./config.json');//配置文件
const defineRouter = require('./libs/router');//定义的路由

var port = config.port; //端口

//自定义的路由
defineRouter(router);

app.keys = ['ss'];
app.use(koaBody())
    .use(middleware())
    .use(router.routes())
    .listen(port,function() {
        console.log("Node运行在 " + port + " 端口");
    });
