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
                var item = res.data.article_contents[that.index];
                that.setData({
                    item,
                    isPicture: item.content_type == 1
                })
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
    },
    /**
     * 浏览图片
     */
    browseImage(e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: [src] // 需要预览的图片http链接列表
        })
    },
    changePic() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    'item.resource_url': res.tempFilePaths[0],
                });
                for (let ins of that.form.article_contents) {
                    if (ins.content_order == that.order) {
                        ins.resource_url = res.tempFilePaths[0];
                        break;
                    }
                }
                wx.setStorage({
                    key: "article_posts",
                    data: that.form
                })
            },
            fail() {
                this.addMedia = false;
                console.log('添加图片失败或取消');
            }
        })
    }
})