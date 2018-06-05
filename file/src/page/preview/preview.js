// page/preview/preview.js
const app = getApp();
const moment = require("../../assets/lib/moment"); //moment
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({
    /**
     * 页面的初始数据
     */
    data: {
        templates: [{
            id: 0,
            img: "",
            desc: '默认',
            bgcolor: '#fff'
        }],
        form: {
            desc: 'default'
        },
        agreeRule: true
    },
    /**
     * checkboxChange
     */
    checkboxChange(e) {
        var len = e.detail.value.length;
        if (len) {
            wx.setStorageSync('agreeRule', true);
            this.setData({
                agreeRule: true,

            })
        } else {
            wx.setStorageSync('agreeRule', false);
            this.setData({
                agreeRule: false,

            })
        }

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        this.type = options.type
        var agreeRule = wx.getStorageSync('agreeRule') || true
        this.get_all_imgs = app.services('/api/v3/bg_imgs/all_imgs').then(res => {
            that.setData({
                agreeRule,
                templates: that.data.templates.concat(res.data)
            })
        }, error => {
            console.log('模板获取失败')
        })
        wx.getStorage({
            key: 'article_posts',
            success(res) {
                wx.getStorage({
                    key: 'userInfo',
                    success: function(userInfo) {
                        res.data.user_info = userInfo.data;
                        let user_hobby = wx.getStorageSync('userInfo').user_hobby
                        res.data.created_at = options.type == 'edit' ? app.getTime() : moment().format('YYYY-MM-DD');
                        res.data.user_hobby_name = user_hobby
                        console.log(res)
                        that.setData({
                            'form': res.data
                        })
                    }
                });
            },
            fail() {
                wx.navigateBack()
            }
        })
    },

    /**
     * 选择模板
     */
    selectTmp(e) {
        let item = e.currentTarget.dataset.item;

        this.setData({
            'form.bg_img_id': item.id,
            'form.article_bgimg': item
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
                        dataUrl: that.data.form.article_bgmusic.music,
                        title: that.data.form.article_bgmusic.name,
                        coverImgUrl: '',
                        success() {
                            that.setData({
                                'form.article_bgmusic.status': true
                            })
                        }
                    })
                } else if (res.status == 1) {
                    wx.pauseBackgroundAudio()
                    that.setData({
                        'form.article_bgmusic.status': false
                    })
                }
            },
            fail(error) {
                wx.playBackgroundAudio({
                    dataUrl: that.data.form.article_bgmusic.music,
                    title: that.data.form.article_bgmusic.name,
                    coverImgUrl: '',
                    success() {
                        that.setData({
                            'form.article_bgmusic.status': true
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
            list = this.data.form.article_contents,
            item = this.data.form.article_contents[index];
        let param = {};
        if (item.status == 'done' || item.status == 'pause') { //当前块录音完成,或者当前块暂停
            this.playRecord(index);
            param['form.article_contents[' + index + '].status'] = 'play';
        } else if (item.status == 'play') {
            param['form.article_contents[' + index + '].status'] = 'pause';
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
            item = this.data.form.article_contents[index];
        wx.playVoice({
            filePath: item.resource_url,
            success() {
                console.log('播放完了');

                let param = {};
                param['form.article_contents[' + index + '].status'] = 'done';
                that.setData(param);
            }
        })

    },
    /**
     * 浏览图片
     */
    browseImage(e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: [src] // 需要预览的图片http链接列表
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    submit(e) {
        console.log('submit');
        wx.createVideoContext('myVideo').pause();
        this.data.form.form_id = e.detail.formId;
        var that = this;
        if (!this.data.form.bg_img_id) { //如果没有背景，则删除背景id
            delete this.data.form.bg_img_id
        }
        if (!this.data.agreeRule) {
            this.toast("请先同意文章发布条款");
            return false
        }
        if (this.data.form.cover_img == '') {
            this.toast("请先返回上一步选择封面");
            return false

        }
        wx.showLoading({
            title: '上传资源...',
            mask: true
        })
        var count = 0;
        var reg = new RegExp("^[http|https]");


        if (!reg.test(that.data.form.cover_img)) {
            app.uploadFile(that.data.form.cover_img, res => {
                console.log(res);

                that.setData({
                    'form.cover_img': res.url
                });
                count = 0; //重置上传进度。
                upload()
            }, error => {
                wx.hideLoading();
                this.toast("封面上传失败，请稍后重试");
            })
        } else {
            count = 0; //重置上传进度。
            upload()
        }

        function upload() {

            let isType = that.data.form.article_contents[count].content_type > 0;
            let isUpload = !reg.test(that.data.form.article_contents[count].resource_url);
            if (isType && isUpload) {
                //可以上传
                app.uploadFile(that.data.form.article_contents[count].resource_url, res => {

                    let param = {};
                    param['form.article_contents[' + count + '].resource_url'] = res.url;
                    that.setData(param);
                    console.log('第' + count + '资源上传成功');
                    console.log(res)
                    if (count >= that.data.form.article_contents.length - 1) {
                        console.log('资源上传成功');

                        wx.hideLoading();
                        //上传结束；
                        // 开始提交表单
                        commit()
                    } else {
                        count++;
                        upload()
                    }

                }, error => {
                    wx.hideLoading();
                    this.toast("资源上传失败，请稍后重试");
                })
            } else {
                // 无需上传，跳过

                if (count >= that.data.form.article_contents.length - 1) {
                    console.log('资源上传成功');


                    //上传结束；
                    // 开始提交表单
                    commit()
                } else {
                    count++;
                    upload()
                }


            }

        }

        function commit() {
            wx.showLoading({
                title: '正在发布...',
                mask: true
            })
            if (that.type == 'create') {
                that.submit = app.services('/api/v3/user_articles/create_article', { data: that.data.form, method: 'POST' }).then(res => {
                    wx.removeStorage({
                        key: 'article_posts',
                        success: function(res) {
                            console.log('缓存已经清除')
                        }
                    })
                    wx.removeStorage({
                        key: 'current_contents',
                        
                    })
                    wx.hideLoading();

                    wx.reLaunch({
                        url: '/page/space/space'
                    })

                }, error => {
                    wx.hideLoading();
                    that.toast('发布失败');
                })
            } else if (that.type == 'edit') {
                that.submit = app.services('/api/v3/user_articles/update_article', { data: that.data.form, method: 'POST' }).then(res => {
                    wx.removeStorage({
                        key: 'article_posts',
                        success: function(res) {
                            console.log('缓存已经清除')
                        }
                    })
                    wx.removeStorage({
                        key: 'current_contents',
                        
                    })
                    wx.hideLoading();

                    wx.navigateBack({
                        delta:2
                    })

                }, error => {
                    wx.hideLoading();
                    that.toast('发布失败');
                })
            }


        }

    },

    goBack() {
        wx.navigateBack()
    },


    onUnload() {
        this.submit.requestTask && this.submit.requestTask.abort()
    }

}, toastScript))