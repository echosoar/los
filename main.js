'use strict';
/**
 * © 2017 soar.gy
 * LOS Main 主文件
 * Main 的作用:
 * 1. 配置合并
 * 2. 处理线程创建、保活及超时中断重启
 * 3. 接受请求，并选取合适的子进程进行处理
 * 
 * 为了防止子进程发生惊群，采取基于round-robin的模型
 * 
 */ 

let cluster = require('cluster');
let os = require('os');
let http = require('http');
let net = require('net');
let FunLosProcessUsage = require('./core/processUsage.js');
let ClassLogger = require('./core/logger.js');
let ClassSocket = require('./core/socket.js');
let Utils = require('./core/utils.js');

class Main {
  constructor(config) {
    this.pwd = process.cwd();

    this.config = Object.assign(
      this._getDefaultConfig(),
      this._getLocalConfig(),
      config );

    this.logger = new ClassLogger(this.config);

    this._childFinderTimeout = 200; // 子进程监控间隔

    this.workers = [];

    this.version = 'LOS V0.0.1';

    this.init();
  }

  // 获取默认配置信息
  _getDefaultConfig() {
    return {
      childNum: os.cpus().length, // 子进程数量，默认为CPU核心数
      httpPort: 80, // 默认http服务端口
      httpsPort: 443, // 默认https服务端口
      timeout: 500 // 默认超时时间
    };
  }

  // 获取本地配置信息
  _getLocalConfig() {

  }

  // 接受子进程消息
  childMessageExec(worker, msg) {

    let nowWorker = this._findNowWorker(worker);

    switch(msg.type) {
      case 'start':
      case 'exec':
      case 'execEnd':
        break;
      default:
        return;
    }
    
    nowWorker.status = msg.type;
    nowWorker.lastUpdateTime = Utils.now();
  }

  // 子进程监控
  startChildFinder() {

    this.workers.map(workerInfo => {
      this.childCheck(workerInfo);
    });

    setTimeout(() => {
      this.startChildFinder();
    }, this._childFinderTimeout);
  }
  
  // 子进程安全性校验，如果超时没有响应，那么自动kill掉然后重启服务
  childCheck(workerInfo) {
    if (workerInfo.status == 'exec') {
      let nowDate = Utils.now();
      if (nowDate - workerInfo.lastUpdateTime < this.config.timeout) return;
      // 下面是超时处理

      this.logger.log('timeout', workerInfo.uuid);
      this.errorResponse(408, 'timeout', socket);
    }
  }

  // 请求分发，选择最合适的子进程去执行
  
  requestToChild(type, socket, response) {
    socket.pause(); // 暂停socket数据读取
    let retryCount = 0;
    let handle = this.httpServer;
    let workerObj = this.selectChild(retryCount, handle);
    

    if (!workerObj) {
      this.logger.log('noUsageWorker');

      this.errorResponse(503, 'no usage worker', socket);

    } else {
      this.logger.log('startChild', 'workid:' + workerObj.worker.id);

      workerObj.handle = socket;
      workerObj.uuid = Utils.uuId();

      workerObj.worker.process.send({
        type: 'connect',
        uuid: workerObj.uuid,
        workid: workerObj.worker.id,
      }, socket);
    }
  }

  /*
    子进程选择的逻辑为：
    优先选择当前进程为start状态，如果都没有
    那么获取cpu与mem占用，过滤掉超出总可用平均值的进程
    如果有子进程符合那就选取cpu + mem最低的去执行
    否则时将进入等待序列，5次重试后继续失败则响应503

    后续可能会对此进行优化，如根据剩余可占用CPU和MEM来创建新的子进程等
  */
  selectChild(retryCount, handle) {
    let workerPids = [];
    let workerPidsMap = {};

    let average = 80/ (this.workers.length + 1);

    for (let i = 0, len = this.workers.length; i < len; i ++) {


      workerPids.push(this.workers[i].worker.process.pid);
      workerPidsMap[this.workers[i].worker.process.pid] = i;

      if (this.workers[i].status == 'starts') {
        return {
          worker: this.workers[i].worker,
          handle
        };
      }
    }

    let usage = FunLosProcessUsage(workerPids).find.filter(child => {
      return child.mem <= average && child.cpu <= average;
    }).sort((a , b) => {
      return (a.mem + a.cpu) - (b.mem + b.cpu);
    });

    if (usage && usage.length) {
      let usageIndex = workerPidsMap[usage[0].pid];
      return {
        worker: this.workers[usageIndex].worker,
        handle
      };
    }

    if (retryCount >= 5) {
      return false;
    } else {
      setTimeout(() => {
        this.selectChild( ++retryCount, handle );
      }, 20);
    }
  }

  // 启服务
  startServer() {
    this.startNetServer();
  }

  // net 服务
  startNetServer() {
    this.netHttpServer = net.createServer();
    this.netHttpServer.listen(this.config.httpPort);
    this.netHttpServer.on('connection', this.requestToChild.bind(this, 'http'));

  }

  // 创建新的子线程
  _createNewChild() {
    let worker = cluster.fork();
    worker.on('message', this.childMessageExec.bind(this, worker));

    this.workers.push({
      worker,
      id: worker.id,
      status: 'unstart',
      lastUpdateTime: new Date() - 0
    });
  }
  
  // 寻找在this.workers中缓存的worker
  _findNowWorker(worker) {
    let thisWorker = null;
    for (let i = 0, len = this.workers.length; i < len; i ++) {
      if (this.workers[i].id == worker.id) {
        thisWorker = this.workers[i];
        break;
      }
    }
    return thisWorker;
  }


  // 错误响应
  errorResponse(errorCode, body, handle) {

  }

  // 初始化，创建主线程及子线程
  init() {
    if (cluster.isMaster) {
      // 主线程用于创建和保活以及超时中断
      for (let i = 0; i < this.config.childNum; i++) {
        this._createNewChild();
      }

      this.startChildFinder();
      this.startServer();

    } else {
      process.send({ type: 'start' }); // 子进程已开启，未运行
      process.on('message', (msg, socket) => {
        process.send({ type: 'exec' });
        new ClassSocket(msg, socket);
      });
    }
  }

}


module.exports = Main;