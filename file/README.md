### 小程序
* 克隆项目

``` 
$ git clone git@172.16.101.16:weixin/leyang.git 
$ cd leyang 
$ npm install
$ mv config.example.js config.js

```

* 新建配置文件或者从副本直接copy

``` javascript 
//config.js

var config = { //七牛配置
	"AccessKey": "",//七牛公钥
	"SecretKey": "",//七牛公钥
	"region": "",//区域
	"domain": "", //CDN加速域名，因为有些视频需要下载，为配合小程序，需支持https
	"putPolicy": {
	    "scope": "test-file",//存储空间
	    "deadline": 3600, //生成上传token的有效期
	    
	},
	"serverIP":''//服务器URL
}
```

* 启动编译

```
$ npm run dev
```

* 打包

```
$ npm run build
```

* 微信开发工具
	打开微信开发工具，选择小程序开发，创建项目，名称为**就喜欢**，appid请看开发文档，选择小程序目录`/home/User/project/leyang/dist`。

* 开发

``` 
$ git checkoout dev 
```
源码都在`src`目录下
### 页面


|                         路径       |       名称       |     参数         |   备注 |  
|:----------------------------------|:----------------|:---------     	|:----|
|page/index/index                   |首页              |无参数          	|     |
|page/space/space                   |空间              |special_column_id,status |     |
|page/recommendation/recommendation |首页              |无参数          	|     |
|page/attenDetail/attenDetail       |TA人页面          |id             	|用户id|
|page/attention/attention           |我的关注           |无参数          	|     |
|page/myCollection/myCollection     |我的收藏           |无参数          	|     |
|page/me/me                         |我的              |无参数          	|     |
|page/commentMore/commentMore       |更多评论           |article_id,atype|     |
|page/thumbMore/thumbMore           |点赞列表　　　        |article_id,atype     		|     |
|page/myContent/myContent           |个人作品            |无参数     		|     |
|page/bootPage/bootPage             |选择兴趣           |无参数     		|     |
|page/inDetail/inDetail             |首页首页详情        |wechat_topic_id,search_status |     |
|page/details/details               |空间详情           |search_status,user_article_id |     |
|page/error/error                   |错误              |无参数     		|     |
|page/musicList/musicList           |背景音乐列表        |无参数    		|     |
|page/create/create                 |发帖              |无参数     		|     |
|page/preview/preview               |发帖预览           |无参数     		|     |
|page/selImg/selImg                 |裁剪封面           |无参数     		|     |
|page/rule/rule                     |发帖规则           |无参数     		|     |
|page/create_record/create_record   |发帖录音编辑        |无参数    		|     |
|page/create_tuwen/create_tuwen     |发帖图面或文本编辑   |无参数     		|     |
|page/create_video/create_video     |发帖视频编辑        |无参数    		|     |
|page/editTitle/editTitle           |发帖标题编辑        |无参数    		|     |
|page/video_play/video_play         |视频播放           |无参数     		|     |
|page/dynamic/dynamic               |动态              |无参数     		|     |
|page/subscription/subscription     |我的订阅　　　　　　　|无参数           |     |
|page/column/column                 |栏目详情　　　　　　　|special_column_id|栏目ID|
|page/history/history               |往期回顾　　　　　　　|无参数　　　　　　　　　　　　|期刊列表|

### 层级关系对应
| 名称 | 标签 | z-index |
| :-------: | :--------:| :--: |
| 视频 | video | 无效 |
| canvas | canvas| 无效|
| toast | 自定义| 9999|
| 底部操作栏| 自定义tabs| 9998|
| 发帖按钮| 自定义| 9998|
| 分享按钮| 自定义| 9998|
| canvas| canvas| 无效|
| 首页翻页|特效|1-4|

### 小程序流程图
![流程图](http://on-img.com/chart_image/5a28e606e4b015e677289ffd.png)

###  七牛上传对接

[SDK文档](https://github.com/gpake/qiniu-wxapp-sdk)

