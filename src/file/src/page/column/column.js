const app = getApp();
var toastScript = require("../../templates/toast/toast")
Page(Object.assign({
    data: {
        loading: true
    },
    onLoad(options) {
        wx.setNavigationBarTitle({ title: options.name });
        if (options.type == 'journal') {
            this.getJournal(options.id)
        } else if (options.type == "columns") {
            this.columns(options.id)
        }
    },
    getJournal(id) {
        app.services('/api/v4/journals/sub_journal_contents', {
            data: {
                journal_id: id
            }
        }).then(res => {
            var views = [];
            var journal = res.data;
            if (journal.special_columns && journal.special_columns.length > 0) {
                views.push({
                    type: "cover",
                    cover_img: journal.cover_img,
                    font_color: journal.font_color,
                    name: journal.name,
                    journal_num: journal.journal_num,
                    user_hobby_id: journal.user_hobby_id,
                    index: 0,
                    columns: journal.special_columns.reduce(function(pre, curn) {
                        pre.push(curn.special_column)
                        return pre
                    }, [])
                })
            }

            journal.special_columns.map(column => {
                column.view_styles.sort((a, b) => {
                    return a.view_style.style_order - a.view_style.style_order
                })
                column.view_styles.map(view => {
                    view.wechat_topics.map(item => {
                        item.title = `【${column.special_column.name}】${item.title}`;
                        item.publish_time = app.getTime(item.publish_time);
                        if (item.cover_img) {
                            item.cover_img += "?imageslim"
                        }
                    })
                    views.push({
                        type: view.view_style.vs_type,
                        count: view.view_style.vs_number,
                        list: view.wechat_topics
                    })
                })
            })
            this.setData({
                loading: false,
                pages: {
                    list: views,
                    index: 0
                }
            })

        }, error => {
            this.toast('出错啦');
            setTimeout(function() {
                wx.navigateBack()
            }, 2000)
        })
    },

    columns(id) {
        app.services('/api/v4/special_columns/sc_contents').then(res => {
            var columns = [],
                views = [];

            res.data.map(journal => {
                journal.special_columns.map(column => {
                    columns.push(column)
                })
            })
            columns = columns.filter(item => {
                return item.special_column.id == id
            });

            columns.map(column => {

                column.view_styles.map(view => {
                    view.wechat_topics.map(item => {

                        item.title = `【${column.special_column.name}】${item.title}`;
                        item.publish_time = app.getTime(item.publish_time);
                        if (item.cover_img) {
                            item.cover_img += "?imageslim"
                        }
                    })
                    views.push({
                        type: view.view_style.vs_type,
                        count: view.view_style.vs_number,
                        list: view.wechat_topics
                    })
                })
            });

            this.setData({
                loading: false,
                pages: {
                    list: views,
                    index: 0
                }
            })

        }, error => {
            this.toast('出错啦');
            setTimeout(function() {
                wx.navigateBack()
            }, 2000)

        })
    },
    sliderErr(e) {
        this.toast(e.detail.msg)
    }
}, toastScript))