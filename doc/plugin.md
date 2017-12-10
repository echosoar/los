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


 *  pathAnalysis 路径解析 (path: String) => path: String
 *  headAnalysis head参数解析 (head)
 *  queryAnalysis query参数解析 (queryObj:Object) => newQuerys: Object
 *  bodyAnalysis body解析 (body) => (body: Object) => body: Object
 *  
 *  fileRead 文件读取 (path:String) => file: Object : {fileName: String, fileExt: String, fileType: string, fileSize: Number, fileContent: String}
 *  head 生成响应头