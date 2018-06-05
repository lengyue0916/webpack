const moment = require("./assets/lib/moment"); //moment
require("./assets/lib/zh-cn"); //moment汉化
const qiniuUploader = require("assets/lib/qiniuUploader");
const q = require("assets/lib/q");
//const wxValidate = require("assets/lib/wxValidate");
import wxValidate from 'assets/lib/wxValidate'


const { windowHeight, windowWidth, system,SDKVersion } = wx.getSystemInfoSync();


class Login {
    constructor() {
        this.info = {};
        this._promise = [];
    }
    set status(value) {
        this.info.login_status = `login ${value}`;
        this.info.status = value;
        if (value == "success") {
            this._promiseAll('resolved');
        } else {
            this._promiseAll('rejected');
        }

    }
    set networkType(value) {
        this.info.networkType = value;
    }
    /*
    获取缓存
     */
    _promiseAll(status) {
        const self = this;
        if (status == 'resolved') {
            this._promise.map(item => {
                item.resolve(self.info)
            })
        } else {
            this._promise.map(item => {
                item.reject(self.info)
            })

            wx.redirectTo({
                url: `/page/error/error?errMsg=${this.info.login_status}`
            })
        }

    }
    login() {
        var userInfo = wx.getStorageSync('userInfo');
        this.session_3rd = wx.getStorageSync('session_3rd');
        const self = this;
        

        if (this.session_3rd == '') {
            //session_3rd不存在
            this.getAuth();
        } else {
            this.checkSession()
        }
    }
    /*
    检查session_3rd是否有效
     */
    checkSession() {
        this.services('/wx_auth/get_session_val', {
            method: "POST"
        }).then(res => {
            if (res.statusCode == 201 && res.data.status == "ok") {
                this.status = "success"
            } else {
                this.status = "error"
            }

        }, error => {
            this.getAuth();
        })

    }

    /*
    获取session_3rd
     */
    getSession(res) {
        const self = this;
        wx.request({
            //必需
            url: `${config.serverIP}/wx_auth/wxLogin`,
            data: {
                userInfo: res[1].userInfo
            },
            method: "POST",
            header: {
                "code": res[0].code,
                'Content-Type': 'application/json'
               //'content-type': 'application/json'
            },
            success(res) {
                console.log(res);
                if (res.statusCode>=200&&res.statusCode < 300) {

                    self.updateUser(res.data.user_info,function(){
                        self.status = "success"
                         console.log(`Login ${self.info.status}`)
                    });
                    self.updateSession(res.data.session_3rd);
                    self.session_3rd = res.data.session_3rd;
                } else {
                    self.status = "error"
                }
               
            },
            fail() {
                self.status = "timeout";
                console.log(self.status)
            }
        })
    }
    getUserInfo() {
        var login = new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    resolve(res)
                }
            })
        })
        var userInfo = new Promise((resolve, reject) => {
            wx.getUserInfo({
                withCredentials: true,
                success: function(res) {

                    resolve({ userInfo: res });
                },
                fail() {
                    reject({
                        errCode: 500,
                        errMsg: '获取用户信息异常',
                    })
                }
            });
           

         });
        Promise.all([login, userInfo]).then(res => {
            this.getSession(res);
        }, error => {
      })
    }
    getAuth() {
        const self = this;
        wx.getSetting({
            success(orize) {
                if (!orize.authSetting['scope.userInfo']) {
                    wx.redirectTo({
             　　　　     url:`/page/default/default`
          　　　      })
                } else {
                    self.getUserInfo()
                   
                }

            }
        })
    }
    getStatus() {
        const self = this;
        var defer = q.defer();
        if (this.info.status == 'success') {
            defer.resolve()
        } else if (this.info.status == 'error') {
            defer.reject()
        }
        this._promise.push(defer);
        return defer.promise
    }
}



class Server extends Login {
    constructor() {
        super();
        this.host = config.serverIP;
        this.services = this.services.bind(this);
        const self = this;
        wx.onNetworkStatusChange(function(res) {
            self.networkType = res.networkType;
        })
    }

    services(url, { data = {}, method = 'GET' } = {}) { //解构赋值，有默认值，可以省略，默认只传token（下面会加入token，此处暂时为空对象），请求方法为GET
        url.charAt(0) != '/' && console.error('接口名称必须以/开始');
        var defer = q.defer()
        data['session_3rd'] = this.session_3rd;

        if (this.info.status && this.info.status == "success") {
            defer.promise.__proto__.requestTask = wx.request({ //发起请求
                url: this.host + url,
                data,
                method,
                header: {
                    'content-type': 'application/json'
                },
                success(res) {
                    // debugger
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        defer.resolve(res)
                    } else {
                        defer.reject(res)
                    }

                },
                fail(error) {
                    defer.reject({
                        status: error.errMsg
                    })
                }
            });
        } else {
            defer.reject({
                status: "请重新登录"
            })
        }


        return defer.promise
    }
    updateUser(param,cp) {
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            userInfo = param
        } else {
            for (var key in param) {
                userInfo[key] = param[key];
            }
        }
        wx.setStorage({
            key: "userInfo",
            data: userInfo,
            success(){
                cp && cp()
            }
        })

    }
    updateSession(val,cp) {
        wx.setStorage({
            key: "session_3rd",
            data: val,
            success(){
               cp && cp()
            }
        })
    }
    getTime(value) {
        if (!value || value == "") {
            return ""
        }
        let today = moment().hours(0).minutes(0).format("YYYY-MM-DD HH:mm");
        let yestoday = moment().subtract(1, 'days').hours(0).minutes(0).format("YYYY-MM-DD HH:mm");
        let year = moment().year();
        var diff;
        if (moment(value).isAfter(today)) {
            diff = moment().diff(moment(value), "m");
            if (diff < 1) {
                return "刚刚";
            } else if (diff < 60) {
                return diff + "分钟前"
            } else if (diff < 300) {
                return moment().diff(moment(value), "h") + "小时前"
            } else {
                return "今天 " + moment(value).format("HH:mm")
            }
        } else if (moment(value).isAfter(yestoday)) {
            return "昨天 " + moment(value).format("HH:mm")
        } else if (moment(value).year() >= year) {
            return moment(value).format("M月D日")
        } else {
            return moment(value).format("YYYY年M月D日")
        }

    }
    getDiff(){
        var a=moment.duration(moment('2016-11-17')-moment('2016-11-16')).as('day');
        console.log(a)
    }

}

var server = new Server();
const { services, getTime,getDiff } = server;
App({
     globalData:{      
          moment:moment  
    },   
    server,
    services,
    getTime,
    windowHeight,
    windowWidth,
    system,
    SDKVersion,
    getDiff,

    /***表单验证**/
   // wxValidate: (rules, messages) => new wxValidate(rules, messages),
    wxValidate: (rules, messages) => new wxValidate(rules, messages),
    /**
     *文件上传
     **/
    uploadFile(file_path, success, fail) {
        // 开始上传
        qiniuUploader.upload(file_path, success, fail, config)
    },
    /**
     *小程序打开
     **/
    onLaunch(options) {
        for (let key in options) {
            this[key] = options[key];
        }
        this.userInfo = wx.getStorageSync('userInfo');
        this.appTitle = "就喜欢";
        this.server.login();
    },
    /**
     *小程序最小化时
     **/
    onHide: function() {
        //最小化时停止背景音乐播放;
        this.browseImageStatus && wx.stopBackgroundAudio()
        console.log('小程序最小化')

    },
    /**
     *小程序最大化时
     **/
    onShow() {
        this.browseImageStatus = 1;
    }


})