var app = getApp();
var toastScript = require("../../templates/toast/toast");

Page(Object.assign({
    data: {
        habbyList: []
    },
    onLoad: function(options) {

        this.userInfo = wx.getStorageSync('userInfo');
        var user_hobby_id = this.userInfo.user_hobby_id;
        var user_hobby = this.userInfo.user_hobby;
        var that = this;
        console.log(user_hobby_id)
        this.setData({
            selected_name: user_hobby,
            selected_id: user_hobby_id
        })

        // 引导页兴趣爱好
        app.services('/api/v4/user_hobbies/all_hobbies').then(res => {

            that.setData({
                hobbyList: res.data
            })
        }, error => {

            that.toast(error.status)
        })
    },
    radioChange(e) { // 选择兴趣
        var selected_id = e.currentTarget.dataset.id;
        var selected_name = e.currentTarget.dataset.name;
        this.setData({
            selected_id,
            selected_name
        });
        this.toIndex()
    },
    toIndex: function() { // 确定按钮
        var selected_id = this.data.selected_id;

        var that = this;

        if (selected_id) {
            // 更新用户兴趣
            app.services('/api/v4/user_hobbies/update_hobby', {
                data: { user_hobby_id: selected_id },
                method: 'POST'
            }).then(res => {


                wx.showToast({
                    title: '兴趣修改成功',
                    duration: 10000
                });
                this.userInfo.user_hobby_id = selected_id;
                this.userInfo.user_hobby = that.data.selected_name;
                app.userInfo = this.userInfo;
                wx.setStorage({
                    key: "userInfo",
                    data: this.userInfo,
                    success() {
                        wx.hideToast()
                        wx.reLaunch({
                            url: '/page/index/index'
                        })
                    },
                    fail() {
                        wx.hideToast()
                    }
                })
            }, error => {
                that.toast('兴趣修改失败');
            })

        } else {
            that.toast('请选择兴趣爱好');
        }
    }
}, toastScript))