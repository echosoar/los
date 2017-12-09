'use strict';
/**
 * © 2017 soar.gy
 * LOS Main 主文件
 * Main 的作用:
 * 1. 配置合并
 * 2. 处理线程创建、保活及超时中断重启
 * 3. 接受请求，并选取合适的子进程进行处理
 */ 

let cluster = require('cluster');
let os = require('os');
let http = require('http');
let losProcessUsage = require('./core/processUsage.js');

class Main {
  constructor(config) {
    this.pwd = process.cwd();

    this.config = Object.assign(
      this._getDefaultConfig(),
      this._getLocalConfig(),
      config );

    this._childFinderTimeout = 200; // 子进程监控间隔

    this.workersMap = {};

    this.init();
  }

  // 获取默认配置信息
  _getDefaultConfig() {
    return {
      childNum: os.cpus().length, // 子进程数量，默认为CPU核心数
      httpPort: 80, // 默认http服务端口
      httpsPort: 443 // 默认https服务端口
    };
  }

  // 获取本地配置信息
  _getLocalConfig() {

  }

  // 接受子进程消息
  childMessageExec(worker, msg) {
    switch(msg.type) {
      case 'start':
      case 'exec':
      case 'execEnd':
        break;
      default:
        return;
    }
    
    this.workersMap[worker.id].status = msg.type;
    this.workersMap[worker.id].lastUpdateTime = new Date() - 0;
  }

  // 子进程监控
  startChildFinder() {

    Object.keys(this.workersMap).map(workerId => {
      this.childCheck(this.workersMap[workerId]);
    });

    setTimeout(() => {
      this.startChildFinder();
    }, this._childFinderTimeout);
  }
  
  // 子进程安全性校验，如果超时没有响应，那么自动kill掉然后重启服务
  childCheck(workerInfo) {
    if (workerInfo.status == 'exec') {
      console.log(workerInfo.id);
    }
  }

  // 请求分发，选择最合适的子进程去执行
  /*
    选择的逻辑为：
    优先选择当前进程为start状态，如果都没有，那么选择cpu + mem占用较低的
  */
  requestToChild(type, request, response) { 
    
  }

  // http服务
  startHttpServer() {
    this.httpServer = http.createServer(this.requestToChild.bind(this, 'http'));
    this.httpServer.listen(this.config.httpPort);
  }

  // 初始化，创建主线程及子线程
  init() {
    if (cluster.isMaster) {
      // 主线程用于创建和保活以及超时中断
      for (let i = 0; i < this.config.childNum; i++) {
        let worker = cluster.fork();
        worker.on('message', this.childMessageExec.bind(this, worker));
        this.workersMap[worker.id] = {
          worker,
          id: worker.id,
          status: 'unstart',
          lastUpdateTime: new Date() - 0
        };
      }

      this.startChildFinder();
      this.startHttpServer();
    } else {
      process.send({ type: 'start' }); // 子进程已开启，未运行
      // process.send({ type: 'exec' }); // 子进程正在执行处理操作

      
    }
  }

}


module.exports = Main;