var app = getApp();
Page({
    data: {
        collectionList: {
            isEnd: false,
            data: []
        },
        loading: true
    },
    onLoad: function() {},
    onShow: function() {
        // 页面加载
        this.onPullDownRefresh();
    },
    onPullDownRefresh: function() {

        this.page = 1;
        // 下拉刷新
        app.services('/api/v4/user_articles/recommend_articles', { // 调用“精彩列表的接口”
            data: {
                page: this.page
            }
        }).then(res => {
            var comtist = res.data;
            comtist.map((item, index) => {
                item.created_at = app.getTime(item.created_at);
            })

            this.setData({
                collectionList: {
                    isEnd: res.data.length < 10,
                    data: comtist
                },
                loading: false
            })
            wx.stopPullDownRefresh()
        }, error => {
            wx.stopPullDownRefresh()
        })

        this.page++;
    },
    onReachBottom: function() {
        // 上拉加载
        if (!this.data.collectionList.isEnd) {
            app.services('/api/v4/user_article_collections/my_collections', {
                data: {
                    page: this.page
                }
            }).then(res => {
                var comtist = res.data;
                comtist.map((item, index) => {
                    item.created_at = app.getTime(item.created_at);
                })
                this.setData({
                    collectionList: {
                        isEnd: res.data.length < 10,
                        data: this.data.collectionList.data.concat(comtist)
                    }
                })
            }, error => {
                this.setData({
                    collectionList: {
                        isEnd: true,
                        data: []
                    },
                    loading: false
                })
            })
            this.page++;
        }
    },
    goDetail: function(e) {
        //查看详情
        var collectable_type = e.currentTarget.dataset.type;
        var id = e.currentTarget.dataset.id;
        let search_status = e.currentTarget.dataset.search_status;
        // 空间详情页
        wx.navigateTo({
            url: '/page/details/details?id=' + id + '&search_status=' + search_status
        })


    }
})