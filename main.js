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
      childNum: os.cpus().length // 子进程数量，默认为CPU核心数
    };
  }

  // 获取本地配置信息
  _getLocalConfig() {

  }

  // 接受子进程
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

  childCheck(workerInfo) {
    if (workerInfo.status == 'exec') {
      console.log(workerInfo.id);
    }
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
    } else {
      process.send({ type: 'start' }); // 子进程已开启，未运行
      // process.send({ type: 'exec' }); // 子进程正在执行处理操作
      
      
    }
  }

}


module.exports = Main;