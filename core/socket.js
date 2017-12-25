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
      // this.request = this._execRequestData(data);
    });
  }

  // 读取socket数据
  readData() {
    return new Promise((resolve, reject) => {
      // this.socketHandle.on("data", data => {
      //   resolve(data.toString());
      // });
      this.socketHandle.resume();
    });
  }

  // 解析数据
  _execRequestData(data) {
    
    let headerEndIndex = data.indexOf('\r\n\r\n');

    let header = {
      ipv6: this.socketHandle.remoteAddress,
      ipv4: this._resolveipv4(this.socketHandle.remoteAddress)
    };
    // console.log("header in")
    data.slice(0, headerEndIndex).split('\r\n').map((headerLine, lineIndex) => {
      if (lineIndex == 0) {
        this._execFirstLine(headerLine, header);
      } else {
        let headerData = headerLine.split(/\s*:\s*/);
        header[headerData[0]] = headerData.slice(1).join(':');
      }
    });
    // console.log("header out")
    let body = data.slice(headerEndIndex + 4);
    return {
      header,
      body
    };
  }

  // 解析http第一行数据
  _execFirstLine(line, headerObj) {
    if (!line || !headerObj) return;
    let matches = /^(.*?)\s(.*?)\s*HTTP(.*)$/ig.exec(line);
    headerObj['method'] = matches[1];
    headerObj['path'] = matches[2];
    headerObj['version'] = 'HTTP' + matches[3];
  }

  // 解析ipv6
  _resolveipv4(ipv6) {
    if (/::ffff/.test(ipv6)) return ipv6.replace('::ffff:', '');
    return null;
  }
}

 module.exports = Socket;