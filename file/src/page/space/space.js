var app = getApp();
var toastScript = require("../../templates/toast/toast")

Page(Object.assign({
    data: {
        loading: true,
        loadMore: false,
        type: "special"
    },
    /**
     * 生命周期函数--页面加载
     */
    onLoad() {
        app.server.getStatus().then(res => {
            this.userInfo = wx.getStorageSync('userInfo');
            this.getData();
            wx.setNavigationBarTitle({ title: `就喜欢-${this.userInfo.user_hobby}` });
        }, error => {
            this.toast(error.login_status)
        })
    },
    /**
     * 生命周期函数--页面渲染完毕
     */
    onReady() {
        app.server.getStatus().then(res => {
            let userInfo = wx.getStorageSync('userInfo');
            if (userInfo.user_hobby_id == null) {
                wx.redirectTo({
                    url: '/page/bootPage/bootPage'
                })
            }
        })
    },

    onShow() {
        if (this.userInfo) {
            let userInfo = wx.getStorageSync('userInfo');
            if (this.userInfo.user_hobby_id != userInfo.user_hobby_id) {
                this.userInfo = userInfo;
                this.getData();
                this.setData({
                    loading: true
                })
                wx.setNavigationBarTitle({ title: `就喜欢-${userInfo.user_hobby}` });
            }
        }

    },
    Toast(e) {
        this.toast(e.detail.msg)
    },
    /**
     *下拉刷新
     **/
    onPullDownRefresh() {

        //文章列表
        this.page = 1;
        app.services('/api/v4/user_articles/all_articles', {
            data: {
                page: this.page
            }
        }).then(res => {

            this.page++;
            if (res.data.length < 10) {
                this.setData({
                    list: res.data,
                    loadMore: false
                })
            } else {
                this.page++;
                this.setData({
                    list: res.data,
                    loadMore: true
                })
            }
            wx.stopPullDownRefresh()
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        })

    },
    /**
     *上拉加载
     **/
    loadmore() {
        if (!this.data.loadMore) {
            return false
        }
        app.services('/api/v4/user_articles/all_articles', {
            data: {
                page: this.page
            }
        }).then(res => {
            res.data.map(item => {
                item.created_at = app.getTime(item.created_at)
            })
            var list = this.data.list.concat(res.data);
            if (res.data.length < 10) {
                this.setData({
                    list,
                    loadMore: false
                })
            } else {
                this.page++;
                this.setData({
                    list,
                    loadMore: true
                })
            }
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        })
    },
    tabs(e) {
        this.setData({
            type: e.currentTarget.dataset.type
        })
    },
    getData() {
        //杂志列表
        app.services('/api/v4/special_columns/sc_list', { data: { status: 0 } }).then(res => {
            this.setData({
                magazine: res.data,
                loading: false
            })
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        });
        //达人秀,专题
        app.services('/api/v4/special_columns/sc_list', { data: { status: 1 } }).then(res => {
            this.setData({
                special: res.data
            })
            //专题内容接口

            if (res.data.length) {
                this.specialList(res.data[0].id);
            } else {
                this.setData({
                    list: [],
                    loading: false
                })

            }
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        })
        //达人秀
        app.services('/api/v4/user_articles/all_articles').then(res => {
            this.setData({
                master: [{
                    img_url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512716387835&di=126465747df10748093df7aa2a96731d&imgtype=0&src=http%3A%2F%2Fwww.qqzhi.com%2Fuploadpic%2F2015-01-04%2F192807679.jpg',
                    name: ""
                }, {
                    img_url: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1876481473,365994793&fm=27&gp=0.jpg',
                    name: ""
                }, {
                    img_url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512716332405&di=bd04f5e14cad6c12b01d04af8235be6b&imgtype=0&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201507%2F07%2F20150707132807_khxWH.thumb.224_0.jpeg',
                    name: ""
                }, {
                    img_url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512716353744&di=ad64c50d9ce63caa210cc933962dbe3e&imgtype=0&src=http%3A%2F%2Fimg3.duitang.com%2Fuploads%2Fitem%2F201502%2F13%2F20150213220600_nZrY8.thumb.224_0.jpeg',
                    name: ""
                }, {
                    img_url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1512716332405&di=bd04f5e14cad6c12b01d04af8235be6b&imgtype=0&src=http%3A%2F%2Fimg5.duitang.com%2Fuploads%2Fitem%2F201507%2F07%2F20150707132807_khxWH.thumb.224_0.jpeg',
                    name: ""
                }]
            })
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        })
        //文章列表
        // this.page = 1;
        // app.services('/api/v4/user_articles/all_articles', {
        //     data: {
        //         page: this.page
        //     }
        // }).then(res => {
        //     res.data.map(item => {
        //         item.created_at = app.getTime(item.created_at)
        //     })

        //     if (res.data.length < 10) {
        //         this.setData({
        //             list: res.data,
        //             loading: false,
        //             loadMore: false
        //         })
        //     } else {
        //         this.page++;
        //         this.setData({
        //             list: res.data,
        //             loading: false,
        //             loadMore: true
        //         })
        //     }

        // }, error => {
        //     this.setData({
        //         loading: false,
        //         loadMore: false
        //     })
        //     this.app.toast(error.errmMsg || '失败');
        // })
    },
    // 切换专题内容列表
    specChange(e) {
        this.specialList(e.currentTarget.dataset.id)
    },
    // 专题内容借口
    specialList(id) {
        this.setData({
            type_id: id
        })
        app.services('/api/v4/special_columns/zt_contents', { data: { special_column_id: id } }).then(res => {
            if (res.data.length) {
                res.data.map(item => {
                    item.create_time = app.getTime(item.create_time)
                })
                this.setData({
                    list: res.data,
                    loading: false
                })
            } else {
                this.setData({
                    list: [],
                    loading: false
                })
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var that = this;
        return {
            title: '就喜欢',
            path: '/page/space/space',
            success: function(res) {
                that.toast('分享成功')
            },
            fail: function(res) {
                // 转发失败
                that.toast('分享失败')

            }
        }
    },
    // 删除帖子
    deleteClick: function(e) {
        // 删除帖子
        var that = this;
        var contentList = that.data.list;
        contentList.filter(function(item, index) {
            if (item.id == e.detail.id) {
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
                                    user_article_id: e.detail.id
                                }
                            }).then(res => {
                                wx.showToast({
                                    title: '删除成功',
                                    icon: 'success',
                                    duration: 2000
                                })
                                contentList.splice(index, 1);
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
            return that.setData({
                list　: 　contentList
            })
        })

    }
}, toastScript))