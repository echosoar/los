'use strict';
/**
 * © 2017 soar.gy
 * LOS 响应
 * 
 */

const Base = require('./base.js');
const HttpCode = require('./httpCode.js');

class Response extends Base {

  constructor(config) {
    super(config);
  }


  init() {
    this._bufferHeadString = [];
    this._bufferHead = null;
    this._bufferBody = null;
  }

  /**
   * @params status 响应码
   * @params headers 覆盖headers
   * @params body 响应体
   */
  out(status, headers, body) {
    headers = headers || {};
    body = body || '';
    
    if (!this.config || !this.config.socket) return;
    this._writeHead(status, {
      'Content-Type': 'text/html'
    });
    this._writeBody(body);
  }

  /**
   * @params ...this.out
   * @params callback jsonp回调
   */
  jsonp(status, headers, body, callback) {
    callback = callback || 'callback';
    this.out(
      status,
      headers,
      [';', callback, '(', JSON.stringify(body), ');'].join('')
    );
  }

  // 写响应头
  _writeHead(status, head) {
    let EnStatus = HttpCode[status] || 'LOS ERROR';
    this._bufferHeadString.push('HTTP/1.1 ' + status + ' ' + EnStatus);
    if (!head) return;

    Object.keys(head).map(key => {
      this._bufferHeadString.push(key + ': ' + head[key]);
    });
  }

  // 写响应体
  _writeBody(body) {
    // 合并头信息
    this.config.socket.write(
      Buffer.from(this._bufferHeadString.join('\r\n') + '\r\n', 'utf8')
    );
    this.config.socket.write(
      Buffer.from(body, 'utf8')
    );
    
    this.config.socket.end();
  }
}

module.exports = Response;