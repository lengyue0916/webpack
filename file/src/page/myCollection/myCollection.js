var app = getApp();
Page({
    data: {
        loading: true,
        isHideLoadMore:false,
        activeIndex: 0,
        tab:['文章收藏','基地收藏'],
        page:1,
        collectionList: {
            isEnd: false,
            data: []
        }
    },
    onShow: function() {
        // 页面加载
        this.onPullDownRefresh();
    },
    onPullDownRefresh: function() {

        this.page = 1;
        // 下拉刷新
        app.services('/api/v4/user_article_collections/my_collections', { // 调用“我的收藏(我的)接口”
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
            wx.stopPullDownRefresh();
        }, error => {
            wx.stopPullDownRefresh();
        })
        this.page++;
    },
    onReachBottom: function() {
        // 上拉加载

        if (!this.data.collectionList.isEnd) {
            this.setData({
               isHideLoadMore:true
            })
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
                        data: comtist
                        //data: this.data.collectionList.data.concat(comtist)
                    },
                    loading: false,
                    isHideLoadMore:false
                })
            }, error => {
                this.setData({
                    collectionList: {
                        isEnd: true,
                        data: [],
                    },
                    loading: false,
                    isHideLoadMore:false
                })
            })
            this.page++;
        }
    },
    
    goDetail: function(e) {
        //查看详情
        var collectable_type = e.currentTarget.dataset.type;
        var id = e.currentTarget.dataset.id;
        var items=e.currentTarget.dataset.item;
        wx.setStorageSync('item_id', items);

        if (collectable_type == 'WechatTopic') {
            // 空间详情页
            wx.navigateTo({
                url: '/page/inDetail/inDetail?id=' + id + '&search_status=0'
            })

        } else { // 基地详情页
            wx.navigateTo({
                url: '/page/baseDetail/baseDetail?id=' + id
            })
        }
    },
    cancleCol: function(e) {
        var index = e.currentTarget.dataset.index;
        var collectable_type = e.currentTarget.dataset.type;
        var article_id = e.currentTarget.dataset.id;
        var collist = this.data.collectionList.data;
        var atype = collectable_type == 'UserArticle' ? 0 : 1;
        var that = this;
        // 取消收藏
        app.services('/api/v4/user_article_collections/cancel_collect', {
            data: {
                article_id: article_id,
                atype: atype
            }
        }).then(res => {
            wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 2000
            })
            collist.splice(index, 1);
            that.setData({
                'collectionList.data': collist
            })
        }, error => {
            wx.showToast({
                title: '取消失败',
                icon: 'error',
                duration: 2000
            })
        })
    },

    cancleColbase: function(e) {
        var index = e.currentTarget.dataset.index;
        var collectable_type = e.currentTarget.dataset.type;
        var base_id = e.currentTarget.dataset.id;
        var collist = this.data.collectionList.data;
       // var atype = collectable_type == 'UserArticle' ? 0 : 1;
        var that = this;
        // 取消收藏
        app.services('/api/v5/health_bases/cancel_collect', {
            data: {
                health_base_id: base_id,
               
            }
        }).then(res => {
            wx.showToast({
                title: '取消收藏',
                icon: 'success',
                duration: 2000
            })
            collist.splice(index, 1);
            that.setData({
                'collectionList.data': collist
            })
        }, error => {
            wx.showToast({
                title: '取消失败',
                icon: 'error',
                duration: 2000
            })
        })
    },

     tabFun:function(e){  
        //获取触发事件组件的dataset属性
         var tab=e.currentTarget.dataset.tab
         console.log(tab) 

    //       wx.setNavigationBarTitle({
    //   　　　　　　　title: '就喜欢-'+tab
    // 　　　　　}) 
         
        this.setData({
          activeIndex: e.currentTarget.id
          
        })
    }  
})