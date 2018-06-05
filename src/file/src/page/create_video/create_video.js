Page({
    data: {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.order = options.order;
        this.index = options.index;
        var that = this;
        wx.getStorage({
            key: "article_posts",
            success(res) {
                that.form = res.data;
                that.setData({
                    item: res.data.article_contents[that.index]
                })
            },
            fail() {
                console.log('获取缓存失败')
            }
        })

    },
    bindinput(e) {
        this.form.article_contents[this.index].content = e.detail.value;
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