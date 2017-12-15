'use strict';
/**
 * © 2017 soar.gy
 * LOS Utils 通用方法类
 * 
 */ 

 class Utils {

  uuId() {
    return this.now() + '-' +  (Math.random() * date + '').replace('.', '-');
  }

  now() {
    return new Date() - 0;
  }
 }

 module.exports = (new Utils());