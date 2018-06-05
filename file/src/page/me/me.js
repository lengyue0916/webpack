var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

    onLoad: function() {
        app.server.getStatus().then(res => {

            var userInfo = wx.getStorageSync('userInfo');
            wx.setNavigationBarTitle({ title: `就喜欢-${userInfo.user_hobby}` });
            var windowWidth = app.windowWidth;
            var border_height = 50;
            var border_radius = (Math.pow(border_height, 2) * 4 + Math.pow(windowWidth, 2)) / (8 * border_height)
            this.setData({
                userInfo,
                border_radius
            })

        })

    },
    onShow() {
        if (this.data.userInfo) {
            let userInfo = wx.getStorageSync('userInfo');
            if (this.data.userInfo.user_hobby_id != userInfo.user_hobby_id) {
                this.setData({
                    userInfo,
                })
                wx.setNavigationBarTitle({ title: `就喜欢-${userInfo.user_hobby}` });

            }
        }
    },

    saveName: function(e) {
        // 保存昵称
        var nick = e.detail.value;
        var oldName = this.data.userInfo.truename || this.data.userInfo.wx_name || '';
        var that = this;

        if (nick == oldName) {
            this.setData({
                'userInfo': this.data.userInfo
            })
            // this.toast('旧昵称')
        } else if (nick == '') {
            that.setData({
                'userInfo': that.data.userInfo
            })
            this.toast('昵称不能为空')
        } else {
            // 更改我的名称
            app.services('/api/v4/user_articles/change_truename', {
                data: {
                    truename: nick
                },
                method: 'POST'
            }).then(res => {
                that.toast('昵称修改成功')

                that.setData({
                    'userInfo.truename': nick
                }, () => {
                    app.userInfo = that.data.userInfo;
                })
                wx.setStorage({
                    key: 'userInfo',
                    data: that.data.userInfo
                })
            }, error => {
                that.toast('昵称修改失败')
                that.setData({
                    'userInfo': that.data.userInfo
                })
            })

        }

    },
    avatarActionSheet: function() {
        var that = this;
        // 从本地选择头像
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(file) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                wx.showLoading({
                    title: '正在上传'
                })
                // 更改我的头像
                app.uploadFile(file.tempFilePaths[0], function(res) {
                    app.services('/api/v4/user_articles/change_user_avatar', {
                        data: {
                            user_avatar: res.url
                        },
                        method: 'POST'
                    }).then(() => {
                        wx.hideLoading();
                        that.toast('头像修改成功')
                        that.setData({
                            'userInfo.user_avatar': res.url
                        });
                        wx.setStorage({
                            key: 'userInfo',
                            data: that.data.userInfo,
                            success() {
                                app.userInfo = that.data.userInfo;
                            }
                        })
                    }, error => {
                        wx.hideLoading();
                        that.toast('头像修改失败')
                    })
                }, function(error) {
                    wx.hideLoading();
                    that.toast('上传头像失败')

                })
            }
        })
    }

}, toastScript));