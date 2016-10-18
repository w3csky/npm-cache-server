/*
 @fileOverview npm 缓存服务
*/
const fs = require('fs');
const path = require('path');

const app = require('koa')();
const koaBody = require('koa-body');
const request = require('request');
const router = require('koa-router')();

const config = require('./config.json');

var port = config.port; //端口
var npmRegistry = config.npmRegistry; //npm url
var host = config.host+port;
var cacheDir = config.cacheDir; //缓存目录

/*
 @descrption: http 请求
 @param {Object} options  请求参数
*/
function getHttpCon(options){
    return new Promise(function(resolve, reject) {
        request(options,(error, response, body)=>{
            var result=body;
            if(!error){
                //替换了 原有的npm库的url  让npm请求本地的url
                result = result.replace(new RegExp(npmRegistry,'ig'),host);
                resolve(result);
            }else{
                reject(error);
            }
        });
    });
}


/*路由规则*/
router.get('/:name', function *(){
    var reqOpt = this.request;


    var options = {
        method: reqOpt.method,
        url: npmRegistry+reqOpt.url,
        header: reqOpt.header
    };

    var result = yield getHttpCon(options);
    this.body = result;

});
router.get('/:name/-/:filename', function *(){
    var reqOpt = this.request;
    var filename = this.params.filename;
    var filePath = path.join(cacheDir,filename);

    var options,stream;

    //判断是否存在缓存文件
    if(fs.existsSync(filePath)){
        stream = fs.createReadStream(filePath);
    }else{
        options = {
            method: reqOpt.method,
            url: npmRegistry+reqOpt.url,
            header: reqOpt.header
        };
        // stream = request(options,(error, response, body)=>{
        //     if(!fs.existsSync(cacheDir)){
        //         mkdirp.sync(cacheDir);
        //     }

        //     fs.writeFileSync(filePath,body,{encoding:'binary'});
        // });
        stream = request(options);

        if(!fs.existsSync(cacheDir)){
            mkdirp.sync(cacheDir);
        }

        stream.pipe(fs.createWriteStream(filePath)); //写入文件
    }

    this.body = stream;
});


/*
 @description: 中间件
*/
function middleware(){
    return function *(next){
        console.log(this.request);
        yield next;//往下执行
    };
}

app.keys = ['ss'];
app.use(koaBody())
    .use(middleware())
    .use(router.routes())
    .listen(port,function() {
        console.log("Node运行在 " + port + " 端口");
    });
