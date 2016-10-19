/*
 @fileOverview 中间件
*/

module.exports = function(){
    return function *(next){
        console.log(this.request);
        yield next;//往下执行
    };
};