'use strict';
/**
 * © 2017 soar.gy
 * LOS Utils 通用方法类
 * 
 */ 

 class Utils {

  uuId() {
    let now = this.now();
    return [now ,(Math.random() * now + '').split('.'), process.hrtime()].join('-');
  }

  now() {
    return Date.now();
  }
 }

 module.exports = (new Utils());