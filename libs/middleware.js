/*
 @fileOverview 中间件
*/

module.exports = function(){
    return function *(next){
        console.log(this.request);
        console.log(this.request.body)
        yield next;//往下执行
    };
};
