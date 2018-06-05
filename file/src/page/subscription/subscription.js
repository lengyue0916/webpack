var app = getApp();
var toastScript = require("../../templates/toast/toast")
Page(Object.assign({

    /**
     * 页面的初始数据
     */
    data: {
        loading: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        //杂志列表
        app.services('/api/v4/journals/my_subscribes').then(res => {
            this.setData({
                subscribes: res.data,
                loading: false
            })
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        });
        // 推荐列表
        app.services('/api/v4/journals/more_journals').then(res => {
            this.setData({
                journals: res.data,
                loading: false
            })
        }, error => {
            this.app.toast(error.errmMsg || '失败');
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    bindsub(e) {
        app.services('/api/v4/journals/sub_journal', {
            data: { journal_id: e.currentTarget.dataset.item.id },
            method: 'POST'
        }).then(res => {
                
            if (res.data.status == 'ok') {
                this.toast('期刊订阅成功');
                this.data.subscribes.unshift(e.currentTarget.dataset.item);
                this.data.journals.splice(e.currentTarget.dataset.index, 1);
                this.setData({
                    subscribes: this.data.subscribes,
                    journals: this.data.journals
                })
            }
        })
    },
    cancelSub(e) {
        var that = this;
        app.services('/api/v4/journals/cancel_sub_journal', {
            data: { journal_id: e.currentTarget.dataset.item.id },
            method: 'POST'
        }).then(res => {
            if (res.data.status == 'ok') {
                that.toast('取消订阅成功');
                that.data.subscribes.splice(e.currentTarget.dataset.index, 1);
                that.data.journals.unshift(e.currentTarget.dataset.item)
                that.setData({
                    subscribes: that.data.subscribes,
                    journals:that.data.journals
                })
            }
        })
    },
    read(e){
        wx.navigateTo({
            url:`/page/column/column?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}&type=journal`
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
},toastScript))