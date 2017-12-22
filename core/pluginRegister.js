/**
 * 插件注册器
 * 为了屏蔽在插件中拿到上层对象的数据的问题
 */
class PluginRegister {
  constructor(register) {
    this.register = register;
  }
  on(pluginInfo, eventType, doing) {
    this.register(pluginInfo, eventType, doing);
  }
}

module.exports = PluginRegister;