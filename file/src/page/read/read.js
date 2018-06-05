var app = getApp();
var toastScript = require("../../templates/toast/toast")
Page(Object.assign({
    /**
     * 页面的初始数据
     */
    data: {
        loading: true,
        hiddenHobby: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.options = options
        app.server.getStatus().then(res => {
            this.userInfo = wx.getStorageSync('userInfo');
            wx.setNavigationBarTitle({ title: `就喜欢-${this.userInfo.user_hobby}` });
            this.getData()
        }, error => {
            this.toast(error.login_status)
        })


    },
    onShow() {
        if (this.userInfo) {
            let userInfo = wx.getStorageSync('userInfo');

            if (this.userInfo.user_hobby_id != userInfo.user_hobby_id) {
                console.info('用户兴趣更新', userInfo.user_hobby)
                this.userInfo = userInfo;
                this.getData();
                this.setData({
                    loading: true
                })
                wx.setNavigationBarTitle({ title: `就喜欢-${userInfo.user_hobby}` });
            }
        }
    },
    /**
     * 生命周期函数--页面渲染完毕
     */

    onReady() {
        var that = this;
        app.server.getStatus().then(res => {
            let userInfo = wx.getStorageSync('userInfo');
            if (that.options.scene) {
                let scene = decodeURIComponent(that.options.scene);
                scene = scene.split(',');
               
                wx.navigateTo({
                    url: scene[4]+'?scene=' + that.options.scene,
                })
                delete that.options.scene
            } else {
                if (userInfo.user_hobby_id == null) {
                    wx.redirectTo({
                        url: '/page/bootPage/bootPage'
                    })
                }
            }
        })
    },
    sliderErr(e) {
        this.toast(e.detail.msg)
    },
    getData() {
        var that = this;
        let url = '/api/v4/wechat_topics/all_articles'

        // 获取期刊
        app.services(url).then(res => {
            if (res.data) {
                var list = [];
                res.data.map((journal, index) => {

                    if (journal.special_columns.length > 0) {
                        list.push({
                            type: "cover",
                            cover_img: journal.cover_img,
                            font_color: journal.font_color,
                            name: journal.name,
                            journal_num: journal.journal_num,
                            user_hobby_id: journal.user_hobby_id,
                            index,
                            columns: journal.special_columns.reduce(function(pre, curn) {
                                pre.push(curn.special_column)
                                return pre
                            }, [])
                        })
                       
                        
                    }
                    journal.special_columns.map(column => {
                        column.view_styles.sort((a, b) => {
                            return a.view_style.style_order - a.view_style.style_order
                        })
                        column.view_styles.map(view => {
                            view.wechat_topics.map(item => {
                                item.title = `【${column.special_column.name}】${item.title}`;
                                item.publish_time = app.getTime(item.publish_time)

                            })
                            list.push({
                                type: view.view_style.vs_type,
                                count: view.view_style.vs_number,
                                list: view.wechat_topics
                            })
                        })
                    })

                })
                this.setData({
                    loading: false,
                    pages: {
                        list,
                        index: 0
                    }
                })
            }

        }, error => {
            that.setData({
                loading: false
            });
            // that.toast(error.status)
        })
        // 获取兴趣
        app.services('/api/v4/user_hobbies/all_hobbies').then(res => {
            this.setData({
                hobbyList: res.data
            })
        }, error => {

            this.toast(error.status)
        })


    },
    moreIntr(e) {
        let status = !e.currentTarget.dataset.status;
        this.setData({
            hiddenHobby: status
        })
    },
    backFirst() {
        this.setData({
            homeback: true
        })

    },
    /**
     * 隐藏兴趣
     */
    hiddenHobby(e) {
        this.setData({
            index: e.detail.index,
            hiddenHobby: true
        })
        console.log(`当前第${e.detail.index+1}页`)
    },
    /**
     * 用户点击右上角分享
     */
    changeHobby(e) {
        // 更新用户兴趣
        var that = this;
        var user_hobby_id = e.currentTarget.dataset.id
        var user_hobby = e.currentTarget.dataset.name

        app.services('/api/v4/user_hobbies/update_hobby', {
            data: {
                user_hobby_id: user_hobby_id
            },
            method: 'POST'
        }).then(res => {

            that.setData({
                hiddenHobby: true
            })

            app.server.updateUser({
                user_hobby_id,
                user_hobby
            }, function() {
                that.onShow();
            })

        }, error => {
            this.toast('兴趣修改失败');
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var that = this;
        return {
            title: '就喜欢',
            path: '/page/read/read',
            success: function(res) {
                that.toast('分享成功')

            },
            fail: function(res) {
                // 转发失败
                that.toast('分享失败')

            }
        }
    }
}, toastScript))