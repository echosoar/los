'use strict';
/**
 * © 2017 soar.gy
 * LOS 响应
 * 
 */

 const Base = require('./base.js');

 class Response extends Base {
  constructor(config) {
    super(config);
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

    console.log(status, headers, body);

    

    this.config.socket.write(body);
    this.config.socket.end();
  }

  /**
   * @params data 数据
   * @params callback jsonp回调
   */
  toJsonp(data, callback) {
    callback = callback || 'callback';
    return [';', callback, '(', JSON.stringify(data), ');'].join('');
  }

}

module.exports = Response;