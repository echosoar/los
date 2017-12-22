/**
 * 插件装载器
 */

const Base = require('./base.js');
const PluginRegister = require('./pluginRegister.js');

class PluginLoader extends Base {
  constructor(plugins, isMaster) {
    super({});

    this.plugins = plugins;
    
    this.isMaster = isMaster;

    this.pluginHandle = {};

    this.load();
  }

  // 绑定事件触发点
  on(pluginInfo, eventType, doing) {
    // 当前点不存在
    if (!this['_exec_' + eventType]) return false;

    if (!this.pluginHandle[eventType]) this.pluginHandle[eventType] = [];

    this.pluginHandle[eventType].push({
      info: pluginInfo,
      doing
    });

    return true;
  }

  // 事件发生
  emit(eventType, ...Args) {
    if (!this['_exec_' + eventType] || !this.pluginHandle[eventType]) return false;
    return this['_exec_' + eventType](...Args);
  }

  // 加载插件
  load() {
    let register = new PluginRegister(this.on.bind(this));
    this.plugins && this.plugins.map(plugin => {
      plugin.register && plugin.register(register.on.bind(register, plugin.info));
    });
  }

  // 请求进入主进程
  _exec_requestInMaster(socket) {
    this.pluginHandle.requestInMaster.map(plugin => {
      plugin.doing(socket);
    });
  }

}

module.exports = PluginLoader;
