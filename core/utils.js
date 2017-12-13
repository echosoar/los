'use strict';
/**
 * © 2017 soar.gy
 * LOS Utils 通用方法类
 * 
 */ 

 class Utils {
  randomId() {
    let date = new Date() - 0;
    return date + '-' +  (Math.random() * date + '').replace('.', '-');
  }
 }

 module.exports = (new Utils());