/*
 @fileOverview 路由定义
*/
const request = require('request');
const config = require('../config.json');//配置文件
const port = config.port; //端口
const npmRegistry = config.npmRegistry; //npm url
const host = config.host+port;
const cacheDir = config.cacheDir; //缓存目录

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


module.exports = function(router){
    //查询时 info  view
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

    // 安装时 发起安装包的请求
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
    
}