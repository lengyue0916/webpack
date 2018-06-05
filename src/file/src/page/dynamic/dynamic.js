var app = getApp();
Page({
    data: {
        loading: true
    },
    onShow: function() {
        // 生命周期函数--监听页面显示
        this.page = 1;
        this.onPullDownRefresh();
    },
    onPullDownRefresh: function() {
        this.page = 1;
        // 下拉刷新
        this.getData('refresh');
    },
    onReachBottom: function() {
        // 上拉加载
        !this.data.isEnd && this.getData('loadmore');
    },
    getData: function(type) {
        var that = this;
        // 我的精彩内容
        app.services('/api/v4/user_articles/my_articles', {
            data: {
                page: this.page
            }
        }).then(res => {
            res.data.map((item, index) => {
                item.created_at = app.getTime(item.created_at);
            })

            that.setData({
                isEnd: res.data.length < 10,
                list: type == 'refresh' ? res.data : that.data.list.concat(res.data)
            })
            that.setData({
                loading: false
            })
            this.page++;
            wx.stopPullDownRefresh();
        }, error => {
            wx.stopPullDownRefresh();
        })

    },
    myContentDetail: function(e) { // 精彩内容详情
        let id = e.currentTarget.dataset.id;
        let search_status = e.currentTarget.dataset.search_status;

        wx.navigateTo({
            url: '/page/details/details?id=' + id + '&search_status=' + search_status
        })
    },
    
})