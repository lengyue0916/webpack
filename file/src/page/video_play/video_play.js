var app = getApp();
Page({
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let url = decodeURIComponent(options.src);
        this.setData({
            url
        })
    }
})