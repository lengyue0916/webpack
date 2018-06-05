var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp();
Page({
    data: {
        tabs: ["关注", "推荐"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        loading: true
    },
    onLoad: function() {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
        // 关注列表
        app.services('/api/v4/user_wechat_focus/my_focus_list').then(res => {
            // debugger
            this.setData({
                attention: res.data,
                loading: false
            })
        }, error => {

        })

    },
    tabClick: function(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
        if (e.currentTarget.id == 1) {
            // 推荐列表
            app.services('/api/v4/user_wechat_focus/pre_focus_list').then(res => {
                this.setData({
                    recommend: res.data
                })
            }, error => {

            })
        }
        if (e.currentTarget.id == 0) {
            // 关注列表
            app.services('/api/v4/user_wechat_focus/my_focus_list').then(res => {
                this.setData({
                    attention: res.data
                })
            }, error => {

            })
        }
    },
    recomBody: function(e) {
        var that = this,
            select = e.currentTarget.dataset.id,
            index = e.currentTarget.dataset.index;
        app.services('/api/v4/user_wechat_focus/focus_user', { data: { follow_id: e.currentTarget.dataset.id }, method: 'POST' }).then(res => {
            var param = {};
            param['recommend[' + index + '].guanZhu'] = true;
            that.setData(param)

        }, error => {})
    },
    attenBody: function(e) {
        var that = this
        app.services('/api/v4/user_wechat_focus/cancel_focus', { data: { user_wechat_focu_id: e.currentTarget.dataset.id } }).then(res => {
            that.data.attention.splice(e.currentTarget.dataset.index, 1);
            that.setData({
                attention: that.data.attention
            })
        }, error => {})
    },
    attenDetail: function(e) {
        wx.navigateTo({
            url: '/page/attenDetail/attenDetail?id=' + e.currentTarget.dataset.id
        })
    },
    onShow: function() {
        this.setData({
            status: 0
        })
        // 关注列表
        app.services('/api/v4/user_wechat_focus/my_focus_list').then(res => {
            this.setData({
                attention: res.data
            })
        }, error => {

        })
    },
});