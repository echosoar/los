# 插件

LOS支持在各个事件节点上面通过插件处理请求，并且LOS的主流程也是基于默认内置插件完成的。
## 插件对象格式

+ name：插件名
+ register：注册
	- point： 注册点
	- doing：插件行为

下面是个插件示例：
```
{
  name: 'Los Test Plugin',
  register: [
    {
      point: 'requestInMaster';
      doing: (req, res, los) => {
        los.log("test plugin at requestInMaster");
        return true;
      }
    },
    {
      point: 'childSelect';
      doing: (canUse, all, los) => {
        los.log("test plugin at childSelect");
        return canUse;
      }
    }
  ]
}
```
## 插件Hock点
#### requestInMaster 请求进入主进程
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| request  | Object  | 请求对象  |
| response  | Object  | 响应对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| True/False  | Bool  | 返回一个布尔值，代表请求在此是否已响应，如果已响应则不执行后续所有内容  |

#### childSelect 子进程选择
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| canUseChilds  | Array  | 当前可使用子进程  |
| allChilds  | Array  | 所有子进程  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| canUseChilds  | Array  | 当前可使用子进程  |

#### requestInChild 请求进入子进程
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| request  | Object  | 请求对象  |
| response  | Object  | 响应对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| True/False  | Bool  | 返回一个布尔值，代表请求在此是否已响应，如果已响应则不执行后续所有内容  |

#### pathAnalysis 路径解析
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| path  | String  | 路径值  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| path  | String  | 新的路径值  |


#### headAnalysis head参数解析
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| head  | Object  | 请求头数据对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| head  | Object  | 新的请求头数据对象  |

#### queryAnalysis query参数解析
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| query  | Object  | query参数数据对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| query  | Object  | 新的query参数数据对象  |

#### bodyAnalysis body解析
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| body  | Object  | body数据对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| body  | Object  | 新的body数据对象  |

#### fileRead 文件读取
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| path  | String  | 文件路径  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| file  | Object  | 文件数据对象，包含 {fileName: String - 文件名, fileExt: String - 文件扩展名, fileType: string - 文件MIME类型, fileSize: Number - 文件大小, fileContent: String - 文件内容} |

#### fileFormat 文件解析
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| file  | Object  | 文件数据对象  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| responentBody  | String or Other FileType | 响应内容 |

#### head 生成响应头
| 入参  | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| nowHead  | Object  | 当前响应头  |
| los | Object | LOS内置对象 |

|  出参 | 参数类型  | 参数意义  |
| ------------ | ------------ | ------------ |
| head  | Object  | 新的响应头 |


## LOS内置对象

LOS内置对象上面挂载者整个请求所有的数据，包括子进程信息、请求路径、请求数据、head头信息、读取的文件信息等，但是此对象不允许在插件中进行修改，插件中只有读取的权限。

© 2017 echosoar