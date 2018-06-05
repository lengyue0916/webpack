var app = getApp();
const toastScript = require("../../templates/toast/toast");
const moment = require("./../../assets/lib/moment");
Page(Object.assign({
    data: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.form = wx.getStorageSync('article_posts');
        this.index = options.index;
        this.order = options.order;
        this.recorderManager = wx.getRecorderManager();
        this.userInfo = wx.getStorageSync('userInfo');
        var item = this.form.article_contents[this.index];
        item.poster = this.userInfo.user_avatar || this.userInfo.wx_avatar;
        item.author = this.userInfo.truename || this.userInfo.wx_name;

        this.setData({
            item,
            record_status: item.resource_url ? "done" : "start"
        })
        var that = this;

        // this.recorderManager.onStart(() => {
        //     console.log('录音开始')
        //     that.setData({
        //         record_status: 'doing',
        //     });
        //     that.inter = setInterval(function() {
        //         that.time += 10;
        //         if (that.time % 1000 == 0) {
        //             wx.setNavigationBarTitle({
        //                 title: moment(that.time).format('mm:ss')
        //             })
        //         }
        //     }, 10);
        // });

        this.recorderManager.onPause(() => {
            console.log('录音暂停');
            clearInterval(that.inter);
            that.setData({
                record_status: 'pause',
            });
        })
        this.recorderManager.onStop(res => {
            console.log('录音结束,src:' + res.tempFilePath)

            try {
                clearInterval(that.inter);
                that.setData({
                    record_status: 'done',
                    'item.resource_url': res.tempFilePath,
                    'item.media_type': 'mp3',

                });
                wx.setNavigationBarTitle({
                    title: '添加录音'
                });
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#ffffff',
                    animation: {
                        duration: 1000,
                        timingFunc: 'linear'
                    }
                })
            } catch (error) {
                console.log('页面已经销毁，录音失败')
            }


        });
    },
    playError(e) {
        this.toast(e.detail.errMsg + ' 播放失败')
    },
    /**
     * 开始录音
     */
    startRecord(e) {
        var that = this;
        if (this.data.record_status == 'start') {
            wx.showModal({
                title: '提示',
                content: '录音过程中请不要离开此页面哦',
                showCancel: false,
                confirmText: '我知道了',
                confirmColor: "#d90012",
                success() {
                    doRecord()
                }
            })
        } else {
            doRecord()
        }

        function doRecord() {
            that.time = 0;
            console.log('录音开始')
            that.setData({
                record_status: 'doing',
            });
            that.inter = setInterval(function() {
                that.time += 10;
                if (that.time % 1000 == 0) {
                    wx.setNavigationBarTitle({
                        title: moment(that.time).format('mm:ss')
                    })
                }
            }, 10);
            //开始录音
            that.recorderManager.start({
                duration: 100000,
                sampleRate: 44100,
                numberOfChannels: 2,
                encodeBitRate: 192000,
                format: 'mp3'
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#d90012',
                animation: {
                    duration: 1000,
                    timingFunc: 'linear'
                }
            })
        }


    },
    // 暂停录音
    pauseRecord() {
        this.recorderManager.pause()
    },
    // 录音继续
    resumeRecord() {
        var that = this;
        this.recorderManager.resume();
        console.log('录音继续');
        that.setData({
            record_status: 'doing',
        });
        that.inter = setInterval(function() {
            that.time += 10;
            if (that.time % 1000 == 0) {
                wx.setNavigationBarTitle({
                    title: moment(that.time).format('mm:ss')
                })
            }
        }, 10);
    },
    // 录音结束
    stopRecord() {
        this.recorderManager.stop();
    },
    // 获取输入值
    bindinput(e) {
        this.form.article_contents[this.index].content = e.detail.value;
    },
    // 完成
    complete() {
        var that = this;
        this.form.article_contents[this.index].resource_url = this.data.item.resource_url;
        wx.setStorage({
            key: "article_posts",
            data: that.form,
            success() {
                wx.navigateBack();
            }
        })
    },
    onUnload() {
        this.recorderManager.stop();
    }
}, toastScript))