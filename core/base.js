'use strict';
/**
 * © 2017 soar.gy
 * LOS 基类
 * 
 */
let ClassLogger = require('./logger.js');
let Utils = require('./utils.js');

class Base {
  constructor(props) {

    this.version = 'LOS V0.0.1';
    
    this.pwd = process.cwd();

    this.config = Object.assign({}, props);

    this.utils = Utils;

    this.logger = new ClassLogger(this.config);

    this.init && this.init();
    
    this.main && this.main();

  }

  addConfig(configs) {
    configs.map(config => {
      this.config = Object.assign(this.config, config);
    });
  }
}

module.exports = Base;