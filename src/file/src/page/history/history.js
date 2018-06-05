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
        app.services('/api/v4/journals/journal_list').then(res => {
            this.setData({
                isEnd: res.data.length < 10,
                historyList: res.data,
                loading: false
            })
        })
    },
    bindsub(e) {
        var item = e.currentTarget.dataset.item,
            index = e.currentTarget.dataset.index;
        if (item.status == 'subscribe_yes') {
            app.services('/api/v4/journals/cancel_sub_journal', {
                data: { journal_id: item.id },
                method: 'POST'
            }).then(res => {
                if (res.data.status == 'ok') {
                    this.toast('取消订阅成功');
                    let params = {};
                    params['historyList[' + index + '].status'] = 'subscribe_no'
                    this.setData(params)
                }
            })
        } else {
            app.services('/api/v4/journals/sub_journal', {
                data: { journal_id: item.id },
                method: 'POST'
            }).then(res => {
                this.toast('期刊订阅成功')
                let params = {};
                params['historyList[' + index + '].status'] = 'subscribe_yes'
                this.setData(params)

            })
        }
    },
    read(e){
        wx.navigateTo({
            url:`/page/column/column?id=${e.currentTarget.dataset.id}&name=${e.currentTarget.dataset.name}&type=journal`
        })
    }

}, toastScript))
