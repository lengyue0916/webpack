var app = getApp();
Page({
    data: {
        loading: true,
        collectionList: {
            isEnd: false,
            data: []
        }
    },
    onLoad: function(option) {
        var windowWidth = app.screenWidth;
        var border_height = 50;
        var border_radius = (Math.pow(border_height, 2) * 4 + Math.pow(windowWidth, 2)) / (8 * border_height);
        var userInfo = wx.getStorageSync('userInfo');
        this.setData({
            border_radius,
            atten_id: option.id,
            userInfo
        });

        //顶部信息
        app.services('/api/v4/user_wechat_focus/follow_info', { data: { follow_id: option.id } }).then(res => {
            this.setData({
                attention: res.data,
                loading: false
            })
        });
        // 列表
        app.services('/api/v4/user_wechat_focus/follow_articles', { data: { follow_id: option.id } }).then(res => {
            var list = res.data;
            list.map((item, index) => {
                item.created_at = app.getTime(item.created_at);
            })
            this.setData({
                attentionList: {
                    isEnd: res.data.length < 10,
                    data: list
                }
            })
        });
    },
    attenBtn: function() {
        app.services('/api/v4/user_wechat_focus/focus_user', { data: { follow_id: Number(this.data.atten_id) }, method: 'POST' }).then(res => {
            this.setData({
                'attention.is_focused': 1
            })

        }, error => {})
    }
})