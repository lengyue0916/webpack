Page({
    data: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.order = options.order;
        var that = this;
        wx.getStorage({
            key: "article_posts",
            success(res) {
                that.form = res.data;
                that.setData({
                    title: res.data.title
                })
            },
            fail() {
                console.log('缓存获取失败');
            }
        })

    },
    bindinput(e) {
        this.form.title = e.detail.value;
    },
    complete() {
        var that = this;
        wx.setStorage({
            key: "article_posts",
            data: that.form,
            success() {
                wx.navigateBack();
            }
        })

    }
})