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

}

module.exports = Response;