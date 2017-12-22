/**
 * 插件装载器
 */

const Base = require('./base.js');

const MasterPoint = [
  'requestInMaster'
];

const ChildPoint = [
  
];

class PluginLoader extends Base {
  constructor(plugins, isMaster) {
    super({});

    this.plugins = plugins;
    
    this.isMaster = isMaster;

    this.allPoint = isMaster ? MasterPoint : ChildPoint;

    this.pluginHandle = {};

    this.load();
  }

  // 事件发生
  emit(eventType) {
    if (!pluginHandle[eventType]) return this.response('noPlugin');

    let plugin = pluginHandle[eventType];

    for (let pluginIndex = 0, pluginSize = plugin.length; pluginIndex < pluginSize; pluginIndex ++) {
      let data = plugin[pluginIndex].doing();
      if (data) return this.response('success', plugin[pluginIndex].name, data);
    }

    return this.response('noPlugin');
  }

  // 加载插件
  load() {
    this.plugins && this.plugins.map(plugin => {
      Object.keys(plugin.register || {}).map(point => {

        if (this.allPoint.indexOf(point) == -1) return;

        if (!this.pluginHandle[point]) {
          this.pluginHandle[point] = [];
        }
        this.pluginHandle[point].push({
          name: plugin.name,
          doing: plugin.register[point]
        });
      });
    });
  }

  // 插件响应
  response(type, pluginName, data) {
    return {
      type,
      pluginName,
      data
    };
  }
}

module.exports = PluginLoader;
