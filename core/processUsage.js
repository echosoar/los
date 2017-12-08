'use strict';
/**
 * © 2017 soar.gy
 * LOS processUsage 进程使用量
 * 作用:
 * 接收一个或多个进程id，返回此进程对于内存和CPU的使用量
 */ 

'use strict';

var exec = require('child_process').execSync;

let processUsage = (pids, type) => {
  if (!pids || !pids.map) pids = [pids];

  type = (type || '').split(' '); // p: pid / n: name / f: find / d: all usage data
  
  if (!type.length) return {};

  let cmd = 'ps -A -o pid,pmem,pcpu,comm';
  let usageData = '';
  let usage = {};

  if (type.indexOf('p')!=-1) usage.pid = {};
  if (type.indexOf('n')!=-1) usage.name = {};
  if (type.indexOf('f')!=-1) usage.find = {};

  try {
    usageData = exec(cmd).toString().split("\n").join("|LOSSPLIT|");

    if (type.indexOf('d')!=-1) usage.data = usageData;

    usageData.replace(/(\d+)\s+([\d\.]+)\s+([\d\.]+)\s+(.*?)\|LOSSPLIT\|/g, (value, pid, mem, cpu, name) => {

      let data = { pid, mem, cpu, name };

      if (usage.pid)  usage.pid[pid - 0] = data;

      if (usage.name) usage.name[name] = data;

      if (usage.find && (pids.indexOf(pid - 0) != -1 || pids.indexOf(pid) != -1)) {
        usage.find[pid - 0] = data;
      }

    });
  } catch(e) {}

  return usage;
}

module.exports = processUsage;