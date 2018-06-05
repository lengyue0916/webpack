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
    editClick(e){
        wx.navigateTo({
            url:"../../page/create/create?type=edit&id="+e.currentTarget.dataset.id
        })
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
    deleteClick: function(e) {
        var user_article_id = e.currentTarget.dataset.id;
        var index = e.currentTarget.dataset.index;
        var contentList = this.data.list;

        var that = this;
        // 删除帖子
        wx.showModal({
            title: '是否确定删除该帖子',
            confirmText: "确定",
            cancelText: "取消",
            confirmColor: '#7448D0',
            cancelColor: '#828282',
            success: function(res) {
                if (res.confirm) {
                    // 删除空间文章
                    app.services('/api/v4/user_articles/delete_article', {
                        data: {
                            user_article_id: user_article_id
                        }
                    }).then(res => {
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success',
                            duration: 2000
                        })
                        contentList.splice(index, 1);
                        that.setData({
                            'list': contentList
                        })
                    }, error => {
                        wx.showToast({
                            title: '删除失败',
                            icon: 'success',
                            duration: 2000
                        })
                    })
                } else {
                    console.log('用户点击取消')
                }
            }
        });
    }
})