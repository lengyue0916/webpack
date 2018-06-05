var WxParse = require('../../templates/wxParse/wxParse.js');
var interactiveScript = require("../../templates/interactive/interactive");
var toastScript = require("../../templates/toast/toast");
var app = getApp();

Page(Object.assign({
    /**
     * 页面的初始数据
     */
    data: {
        openConfirm: false,
        loading: true
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userInfo = wx.getStorageSync('userInfo');
        var that = this;
        if (options.scene) {
            let scene = decodeURIComponent(options.scene);
            scene = scene.split(',');
            options = {};
            options.id = scene[0];
            options.search_status = scene[1];
            options.user_hobby_id = scene[2];
            options.share_id = scene[3];
            options.share_path = scene[4];
            app.server.getStatus().then(res => {
                app.services('/api/v4/shares/click_share_topic', {
                    data: {
                        share_topic_id: Number(options.share_id)
                    }
                }).then(rect => {

                })
            })
        }

        this.setData({
            article_id: options.id,
            atype: 1,
            search_status: options.search_status,
            userInfo
        })
        wx.setNavigationBarTitle({ title: '就喜欢' });
        var that = this;
        app.server.getStatus().then(res => {

            that.getData(options, userInfo)

        }, error => {

        })

        this.context = wx.createCanvasContext('myCanvas');

    },
    shareError(e) {
        this.toast(e.detail.msg)
    },
    getData(options, userInfo) {
        var that = this;
        app.services('/api/v4/wechat_topics/get_article', {
            data: {
                wechat_topic_id: options.id,
                search_status: options.search_status
            }
        }).then(res => {
            if (userInfo.user_hobby_id == null) {
                app.services('/api/v4/user_hobbies/update_hobby', {
                    data: { user_hobby_id: res.data.article.user_hobby_id },
                    method: 'POST'
                }).then(rect => {
                    userInfo.user_hobby_id = rect.data.article.user_hobby_id;
                    userInfo.user_hobby = rect.data.article.user_hobby_name;
                    app.appTitle = "就喜欢-" + rect.data.article.user_hobby_name;
                    wx.setStorage({
                        key: "userInfo",
                        data: userInfo
                    })
                }, error => {
                    console.log('提交失败');

                })
            }
            res.data.article_comments.map((item, index) => {
                item.created_at = app.getTime(item.created_at);
            })
            var article
            if (res.data.article.source_topic == 'wudaowu') {
                article = "<video src='" + res.data.article.content + "'></video>"
            } else {
                article = res.data.article.content;
            }
            that.setData({
                title: res.data.article.title,
                read_num: res.data.article.read_num,
                cover_img: res.data.article.cover_img,
                publish_time: app.getTime(res.data.article.publish_time),
                is_collect: res.data.is_collect,
                is_vote: res.data.is_vote,
                article_votes_count: res.data.article_votes_count,
                article_comments_count: res.data.article_comments_count,
                votes: res.data.article_votes,
                commentList: res.data.article_comments,
                user_hobby_id: res.data.article.user_hobby_id,
                user_hobby: res.data.article.user_hobby_name
            })
            /**
             * WxParse.wxParse(bindName , type, data, target,imagePadding)
             * 1.bindName绑定的数据名(必填)
             * 2.type可以为html或者md(必填)
             * 3.data为传入的具体数据(必填)
             * 4.target为Page对象,一般为this(必填)
             * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
             */
            // article="<audio poster='http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000' name='此时此刻' author='许巍' src='http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46'></audio>"
            WxParse.wxParse('article', 'html', article, that, 8);
            that.setData({
                shareData: {
                    path: "page/inDetail/inDetail",
                    title: res.data.article.title,
                    cover_img: res.data.article.cover_img,
                    article_id: options.id,
                    search_status: options.search_status,
                    user_hobby_id: res.data.article.user_hobby_id
                }
            })
        }, error => {
            this.setData({
                loading: false
            })

            this.toast(error.data.error)
        })
    },
　　　//文章里面链接跳转
    wxParseTagATap: function(e){
    var href = e.currentTarget.dataset.src;
    console.log(href);
    //我们可以在这里进行一些路由处理
   
      wx.redirectTo({
        url: href
      })
  }, 

    /**
     * 用户点击右上角分享
     */

    onShareAppMessage: function() {
        var that = this;
        var scene = this.data.article_id + ',' + this.data.search_status + ',' + this.data.user_hobby_id + ',' + this.share_id + ',' + '/page/inDetail/inDetail';
        //console.log('/page/index/index?scene=' + scene);
        return {
            title: this.data.title,
            imageUrl: this.data.cover_img + '!shareCard',
            path: '/page/index/index?scene=' + scene,
            //path: '/page/inDetail/inDetail?scene=' + scene,
            success: function(res) {
                console.log(res)
                wx.showToast({
                    title: "分享成功",
                    duration: 2000

                });
                that.setData({
                    openShare: false
                })
            },
            fail: function(res) {
                // 转发失败
                that.toast('分享失败');

            }
        }
    },
    shareHandle() {
        var that = this;
        app.services('/api/v4/shares/add_share', {
            data: {
                wechat_topic_id: that.data.article_id
            }
        }).then(rect => {
            that.share_id = rect.data.id
            that.setData({
                openShare: true
            })
        }, error => {
            that.share_id = undefined;
            that.toast('分享失败')
        })

    }
}, interactiveScript, toastScript))