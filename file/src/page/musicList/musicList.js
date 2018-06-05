// page/musicList/musicList.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

    /**
     * 页面的初始数据
     */
    data: {
        loading: true,
        select_item_id: null,
        open_group_id: 1,
        groupID: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        var that = this;
        const backgroundAudioManager = wx.getBackgroundAudioManager();
        backgroundAudioManager.onWaiting(function() {
            that.setData({
                musicWaiting: 1
            })
        })
        backgroundAudioManager.onPlay(function() {
            that.setData({
                musicWaiting: 0

            })
        })

        backgroundAudioManager.onError(function(e) {
            that.setData({
                musicWaiting: 2
            })
            var errMsg;
            switch (e.errCode) {
                case 10001:
                    errMsg = '系统错误,播放失败';
                    break;
                case 10002:
                    errMsg = '网络错误,播放失败';
                    break;
                case 10003:
                    errMsg = '文件错误,播放失败';
                    break;
                case 10004:
                    errMsg = '格式错误,播放失败';
                    break;
                default:
                    errMsg = '播放失败';
            }
            that.toast(errMsg);
            that.setData({
                groupID: null,
                select_item_id: null
            });
        })

        wx.getStorage({
            key: 'article_posts',
            success: function(storage) {
                that.form = storage.data;
            },
            fail() {
                wx.navigateBack()
            }
        })
        app.services('/api/v3/bg_musics/all_musics').then(res => {
            that.setData({
                select_item_id: that.form.bg_music_id,
                list: res.data,
                loading: false
            });
            if (res.data.length > 0) {
                that.setData({
                    open_group_id: res.data[0].music_type.id,
                });
            }

        }, error => {
            that.setData({
                list: [],
                loading: false
            });
            that.toast('背景音乐获取失败');
            // debugger
        })

    },
    toggle(e) {
        let open_group_id = e.currentTarget.dataset.group.id;

        // this.setData({ //可关闭的
        //     open_group_id: open_group_id==this.data.open_group_id?null:open_group_id,
        // });
        this.setData({ //不可关闭的
            open_group_id,
        });
        // wx.pageScrollTo({
        //     scrollTop: 0
        // })
    },
    select(e) {
        this.form.article_bgmusic = e.currentTarget.dataset.item;
        this.form.bg_music_id = e.currentTarget.dataset.item.id;
        this.setData({
            groupID: e.currentTarget.dataset.groupid,
            select_item_id: e.currentTarget.dataset.item.id
        });
        wx.playBackgroundAudio({
            dataUrl: e.currentTarget.dataset.item.music,
            title: e.currentTarget.dataset.item.name,
            coverImgUrl: ''
        })
    },
    cancel(){
        this.form.article_bgmusic = null;
        this.form.bg_music_id = null;
        this.setData({
            groupID: null,
            select_item_id: null
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        wx.stopBackgroundAudio()
        wx.setStorage({
            key: 'article_posts',
            data: this.form
        })
    },
}, toastScript))