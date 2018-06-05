// page/rule/rule.js
const app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');
Page({

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.services('/api/v3/user_articles/publish_attention').then(res => {
            let content = res.data||''
            WxParse.wxParse('content', 'html', content, this, 8);
        }, error => {

        })
    }

})