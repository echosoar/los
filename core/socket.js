'use strict';
/**
 * © 2017 soar.gy
 * LOS Socket
 * 作用:
 * 解析socket，生成request和response对象
 */ 
let Response = require('./response.js');
class Socket {
  
  constructor(workerInfo, socketHandle) {
    this.workerInfo = workerInfo;
    this.socketHandle = socketHandle;

    this.request = {};

    this.readData().then(data => {
      this.request = this._execRequestDate(data);
    });
  }

  // 读取socket数据
  readData() {
    return new Promise((resolve, reject) => {
      this.socketHandle.on("data", data => {
        resolve(data.toString());
      });
      this.socketHandle.resume();
    });
  }

  // 解析数据
  _execRequestDate(data) {
    let dataSplited = data.split('\r\n');
    console.log(dataSplited);
  }
}

 module.exports = Socket;