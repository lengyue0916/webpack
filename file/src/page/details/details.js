var app = getApp()
var interactiveScript = require("../../templates/interactive/interactive");
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

    /**
     * 页面的初始数据
     */
    data: {
        article: {
            desc: 'default'
        },
        openConfirm: false,
        loading: true,
        is_share: false,
        shareSheet: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.scene) {
            let scene = decodeURIComponent(options.scene);
            scene = scene.split(',');
            options = {};
            options.id = scene[0];
            options.search_status = scene[1];
            if (scene.length > 2) {
                options.user_hobby_id = scene[2];
            }
        }
        console.log(options);
        var that = this;
        this.context = wx.createCanvasContext('myCanvas');
        
        let userInfo = wx.getStorageSync('userInfo')
        this.data.article_id = options.id;
        this.data.atype = 0;
        this.setData({
            article_id: options.id,
            atype: 0,
            search_status: options.search_status,
            userInfo
        });
        wx.setNavigationBarTitle({ title: '就喜欢' });
        app.server.getStatus().then(res => {
            that.getData(options, userInfo)
        }, error => {

        })

    },
    shareError(e) {
        this.toast(e.detail.msg)
    },
    /*
    获取数据
     */
    getData(options, userInfo) {
        var that = this;
        app.services('/api/v4/user_articles/get_article', {
            data: {
                user_article_id: options.id,
                search_status: options.search_status
            }
        }).then(res => {
            // debugger
            if (userInfo.user_hobby_id == null) {
                app.services('/api/v4/user_hobbies/update_hobby', {
                    data: { user_hobby_id: res.data.article.user_hobby_id },
                    method: 'POST'
                }).then(res => {
                    userInfo.user_hobby_id = res.data.article.user_hobby_id;
                    userInfo.user_hobby = res.data.article.user_hobby_name;
                    app.appTitle = "就喜欢-" + res.data.article.user_hobby_name;
                    wx.setStorage({
                        key: "userInfo",
                        data: userInfo
                    })
                }, error => {
                    console.log('提交失败');

                })
            }
            let list = res.data.article_contents = res.data.article_contents.sort((first, second) => {
                return first.content_order - second.content_order;
            });
            list.map((item, index) => {
                if (item.content_type == 2) {
                    item.status = 'loading';
                }

            })

            res.data.article.article_contents = list;
            res.data.article.created_at = app.getTime(res.data.article.created_at);
            var votes = res.data.article_votes;
            var commentList = res.data.article_comments || [];

            commentList.map((item, index) => {
                item.created_at = app.getTime(item.created_at);
            })
            that.setData({
                shareData: {
                    path: "page/details/details",
                    title:res.data.article.title,
                    cover_img:res.data.article.cover_img,
                    article_id: options.id,
                    search_status: options.search_status,
                    user_hobby_id: res.data.article.user_hobby_id
                }
            })

            that.setData({
                article: res.data.article,
                is_focus: res.data.is_focus,
                commentList,
                votes,
                is_collect: res.data.is_collect,
                article_votes_count: res.data.article_votes_count,
                article_comments_count: res.data.article_comments_count,
                is_vote: res.data.is_vote,
                loading: false
            }, res => {
                if (that.data.article.bg_music_id != null) {
                    that.playMusic();
                }
                that.data.article.article_contents.map((item, index) => {
                    if (item.content_type == 2) {
                        let fileExtension = item.resource_url.substring(item.resource_url.lastIndexOf('.') + 1)

                        if (fileExtension == 'silk') {
                            console.log('开始下载');
                            (index => {
                                let url = that.data.article.article_contents[index].resource_url;
                                wx.downloadFile({
                                    url: url,
                                    success(rec) {
                                        console.log('下载成功');
                                        console.log(rec);
                                        var param = {};
                                        param['article.article_contents[' + index + '].resource_url'] = rec.tempFilePath;
                                        param['article.article_contents[' + index + '].status'] = 'done';
                                        param['article.article_contents[' + index + '].media_type'] = 'silk';
                                        that.setData(param);
                                    },
                                    fail(error) {

                                        console.log('下载失败')
                                    }
                                })
                            })(index)
                        } else {
                            var param = {};
                            param['article.article_contents[' + index + '].media_type'] = 'mp3';
                            that.setData(param);

                        }

                    }
                })


            })
        }, error => {
            // debugger
        })
    },
    /**
     * 播放背景音乐
     */

    playMusic() {
        var that = this;
        wx.getBackgroundAudioPlayerState({
            success(res) {
                if (res.status == 2 || res.status == 0) {
                    wx.playBackgroundAudio({
                        dataUrl: that.data.article.article_bgmusic.music,
                        title: that.data.article.article_bgmusic.name,
                        coverImgUrl: '',
                        success() {
                            that.setData({
                                'article.article_bgmusic.status': true
                            })
                        }
                    })
                } else if (res.status == 1) {
                    wx.pauseBackgroundAudio()
                    that.setData({
                        'article.article_bgmusic.status': false
                    })
                }
            },
            fail(error) {

                wx.playBackgroundAudio({

                    dataUrl: that.data.article.article_bgmusic.music,
                    title: that.data.article.article_bgmusic.name,
                    coverImgUrl: '',
                    success() {
                        that.setData({
                            'article.article_bgmusic.status': true
                        })
                    }
                })

            }
        })
    },
    /**
     * 播放语音
     */

    controlRecord(e) {
        var that = this,
            index = e.currentTarget.dataset.index,
            list = this.data.article.article_contents,
            item = this.data.article.article_contents[index];
        let param = {};
        if (item.status == 'loading') {
            console.log('正在下载');

        } else if (item.status == 'done' || item.status == 'pause') { //当前块录音完成,或者当前块暂停

            param['article.article_contents[' + index + '].status'] = 'play';
            that.playRecord(index);

        } else if (item.status == 'play') {
            param['article.article_contents[' + index + '].status'] = 'pause';
            wx.pauseVoice()
        }



        this.setData(param)
    },

    /**
     * 播放录音
     */
    playRecord: function(index) {

        if (this.data.exitVideo) { //如果存在视频则暂停播放视频
            wx.createVideoContext('myVideo').pause();

        }
        var that = this,
            item = this.data.article.article_contents[index];
        wx.playVoice({
            filePath: item.resource_url,
            success() {
                console.log('播放完了');

                let param = {};
                param['article.article_contents[' + index + '].status'] = 'done';
                that.setData(param);
            }
        })

    },
    /**
     * 浏览图片
     */
    browseImage(e) {
        let src = e.currentTarget.dataset.src;
        app.isBrowseImage = true;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: [src] // 需要预览的图片http链接列表
        })
    },
    /**
     * 录音播放失败
     */
    playError(e) {
        this.toast(e.detail.errMsg + ' 播放失败')
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        wx.stopBackgroundAudio()
    },
    onHide: function() {
        if (!app.isBrowseImage) {
            wx.stopBackgroundAudio();
        }
    },
    onShow() {
        app.isBrowseImage = false;
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var that = this;
        return {
            title: this.data.article.title,
            imageUrl: this.data.article.cover_img + '!shareCard',
            path: '/page/details/details?id=' + this.data.article_id + '&search_status=' + this.data.search_status + '&user_hobby_id=' + this.data.article.user_hobby_id,
            success: function(res) {
                wx.showToast({
                    title: "分享成功",
                    duration: 2000

                });
            },
            fail: function(res) {
                that.toast('分享失败');
            }
        }
    },
    // 关注按钮
    attenBtn: function() {
        app.services('/api/v4/user_wechat_focus/focus_user', { data: { follow_id: Number(this.data.article.user_id) }, method: 'POST' }).then(res => {
            this.setData({
                is_focus: 1
            })
        }, error => {})
    },
    shareHandle() {
        this.setData({
            openShare: true
        })
    },
    //跳转他人空间
    personInfo(e) {
        wx.navigateTo({
            url: "../attenDetail/attenDetail?id=" + e.currentTarget.dataset.id
        })
    }
}, interactiveScript, toastScript))