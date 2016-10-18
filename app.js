/*
 @fileOverview npm 缓存服务
*/
const fs = require('fs');
const path = require('path');

const app = require('koa')();
const koaBody = require('koa-body');
const request = require('request');
const router = require('koa-router')();


var port = 3345; //端口
var npmRegistry = 'https://registry.npmjs.org'; //npm url
var host = 'http://localhost:'+port;
var cacheDir = './cache'; //缓存目录

/*
 @descrption: http 请求
*/
function getHttpCon(options){
    return new Promise(function(resolve, reject) {
        request(options,(error, response, body)=>{
            var result=body;
            if(!error){
                result = result.replace(new RegExp(npmRegistry,'ig'),host);
                //console.log(result);
                resolve(result);
            }else{
                reject(error);
            }
        });
    });
}


/*路由规则*/
router.get('/:name', function *(){
    //console.log(this.request);
    var reqOpt = this.request;


    var options = {
        method: reqOpt.method,
        url: npmRegistry+reqOpt.url,
        header: reqOpt.header
    };
    
    // var x = request(options,(error, response, body)=>{
    //     var result=body;
    //     if(!error){
    //         result = result.replace(new RegExp(npmRegistry,'ig'),host);
    //     }
    //     this.body = result;
    //     //console.log(response);
    // });
    //this.body = x;

    var result = yield getHttpCon(options);
    this.body = result;

});
router.get('/:name/-/:filename', function *(){
    //console.log(this.request);
    var reqOpt = this.request;
    var filename = this.params.filename;
    var filePath = path.join(cacheDir,filename);

    var options,stream;

    if(fs.existsSync(filePath)){
        stream = fs.createReadStream(filePath);
        console.log('read')
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

        stream.pipe(fs.createWriteStream(filePath));
    }
    
    this.body = stream;
});

//中间件
function middleware(){
    // console.log(this.request);

    // yield next;
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
