'use strict';
/**
 * © 2017 soar.gy
 * LOS Socket
 * 作用:
 * 解析socket，生成request和response对象
 */ 

class Socket {
  
  constructor(workerInfo, socketHandle) {
    this.workerInfo = workerInfo;
    this.socketHandle = socketHandle;

    this.readData().then( data => {
      console.log("child data", data);
    });
  }

  readData() {
    return new Promise((resolve, reject) => {
      this.socketHandle.on("data", data => {
        resolve(data.toString());
      });
      this.socketHandle.resume();
    });
  }
}

 module.exports = Socket;