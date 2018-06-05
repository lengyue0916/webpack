// components/record/record.js
const moment = require("./../../assets/lib/moment");

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        poster: {
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: 'upDatePoster' // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },
        name: {
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: 'upDateName' // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },

        url: {
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: 'upDateUrl' // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },
        themb:{
            type:Boolean,
            value:false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        play_status: '',
        time: '00:00'
    },
    created(){
        this.innerAudioContext = wx.createInnerAudioContext();
    },
    attached(e) {
        this.innerAudioContext.onPlay(() => {
            console.log('开始播放录音');
            this.setData({
                play_status: 'play'
            })
        })
        this.innerAudioContext.onPause(() => {
            console.log('录音播放暂停')
            this.setData({
                play_status: 'pause'
            })
        })

        this.innerAudioContext.onEnded(() => {
            console.log('录音播放结束')
            this.setData({
                play_status: 'stop'
            })
        })


        this.innerAudioContext.onTimeUpdate((res) => {
            let currentTime = this.innerAudioContext.currentTime;
            currentTime = moment(currentTime * 1000).format('mm:ss');
            console.log('音频播放进度更新', currentTime)
            this.setData({
                time: currentTime
            })
        })
        this.innerAudioContext.onWaiting((res) => {
            //缓冲
        })
        this.innerAudioContext.onError((error) => {
            console.log(error);
            switch (error.errCode) {
                case 10001:
                    error.errMsg = '系统错误';
                    break;
                case 10002:
                    error.errMsg = '系统错误';
                    break;
                case 10003:
                    error.errMsg = '系统错误';
                    break;
                case 10004:
                    error.errMsg = '系统错误';
                    break;
                default:
                    error.errMsg = '';
            }
            
            var myEventDetail = error // detail对象，提供给事件监听函数
            this.triggerEvent('error', myEventDetail, {})
            this.setData({
                play_status: ''
            })
        })
    },
    /**
     * 组件的方法列表
     */
    methods: {
        upDatePoster(newVal) {
            this.setData({
                poster: newVal
            })
        },
        upDateName(newVal) {
            this.setData({
                name: newVal
            })
        },

        upDateUrl(newVal) {
            this.innerAudioContext.src = newVal;
            this.setData({
                time: '00:00'
            })
        },
        tap() {
            if (this.data.play_status == 'play') {
                this.innerAudioContext.pause();
            } else {
                this.innerAudioContext.play();
            }
        }

    },
    /*
    组件销毁
     */
    detached() {
        // 销毁当前音频实例。
        this.innerAudioContext.destroy()
    }
})