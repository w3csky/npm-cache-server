# npm-cache-server
npm 缓存服务，用于公司网络中缓存已安装的包，主要是tgz文件，方便同一个局域网内快速安装。

## 日志
* 0.0.1  目前只支持 install info 这两个功能

## 安装
```shell
npm i
```

## 启动
```shell
npm start 
```

## 使用
```shell
npm set registry http://localhost:3345
```

## 恢复原来的库
```shell
npm set registry https://registry.npmjs.org/
```