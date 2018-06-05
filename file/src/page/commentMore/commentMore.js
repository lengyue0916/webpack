var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({
    data: {
        openConfirm: false,
        commentList: {
            isEnd: false,
            data: []
        }
    },
    openReply(e) {
        this.pid = e.currentTarget.dataset.pid;
        this.user_name = e.currentTarget.dataset.username;
        this.user_id = e.currentTarget.dataset.userid;
        this.index = e.currentTarget.dataset.index;

        this.setData({
            openConfirm: true,
            username: this.user_name
        })

    },
    closeConfirm() {
        this.setData({
            openConfirm: false
        })
    },
    onLoad: function(options) {
        this.article_id = options.article_id;
        this.atype = options.atype;
        let userInfo  = wx.getStorageSync('userInfo');
        this.setData({
            userInfo
        })
        this.onPullDownRefresh();
    },
    onPullDownRefresh: function(e) { // 下拉刷新
        this.page = 1;
        // 获取文章所有评论
        app.services('/api/v4/user_article_comments/all_comments', {
            data: {
                page: this.page,
                article_id: this.article_id,
                atype: this.atype
            }
        }).then(res => {
            var comtist = res.data.article_comments;
            comtist.map((item, index) => {
                item.p_comment.created_at = app.getTime(item.p_comment.created_at);
            })
            this.setData({
                commentList: {
                    isEnd: res.data.article_comments.length < 10,
                    data: comtist
                },
                count: res.data.article_comments_count
            })
            wx.stopPullDownRefresh()
        }, error => {
            this.setData({
                commentList: {
                    isEnd: true,
                    data: []
                }
            })
            wx.stopPullDownRefresh()
        })
        this.page++;
    },
    onReachBottom: function(e) {
        // 上拉加载

        var that = this;
        if (!this.data.commentList.isEnd) {
            app.services('/api/v4/user_article_comments/all_comments', {
                data: {
                    page: this.page,
                    article_id: this.article_id,
                    atype: this.atype
                }
            }).then(res => {
                var comtist = res.data.article_comments;
                comtist.map((item, index) => {
                    item.p_comment.created_at = app.getTime(item.p_comment.created_at);
                })
                comtist = that.data.commentList.data.concat(comtist)

                that.setData({
                    commentList: {
                        isEnd: res.data.article_comments.length < 10,
                        data: comtist
                    }
                })

            }, error => {
                this.setData({
                    commentList: {
                        isEnd: true,
                        data: []
                    }
                })
            })
            this.page++;
        }
    },
    submit(e) {
        var that = this;

        var userInfo = wx.getStorageSync('userInfo');
        var app = getApp();
        wx.createSelectorQuery().select('#comment-textarea').fields({
            properties: ['value']
        }, function(res) {
            var content = res.value;
            // 提交回复
            var newList = that.data.commentList.data[that.index].s_comments;
            var time = app.getTime(new Date());
            if (content != '') {
                wx.showLoading({
                    title: '发表中...',
                    mask: true
                })
                app.services('/api/v4/user_article_comments/create_comment', {
                    data: {
                        content: content,
                        article_id: that.article_id,
                        pid: that.pid,
                        reply_user_id: that.user_id,
                        atype: that.atype
                    },
                    method: 'POST'
                }).then(res => {
                    newList.push({
                        user_name: that.data.userInfo.truename,
                        reply_user_name: that.user_name,
                        content
                    });
                    let param = {};
                    param['commentList.data[' + that.index + '].s_comments'] = newList;
                    param['openConfirm'] = false;
                    param['count'] = that.data.count + 1;
                    // 关闭评论框
                    that.setData(param);
                    wx.hideLoading();
                    that.toast('评论成功')
                }, error => {
                    wx.hideLoading();
                    that.toast('评论失败')
                    // 关闭评论框
                    that.setData({
                        openConfirm: false
                    })
                })
            } else {
                that.toast('评论内容不能为空')
                return false
            }


        }).exec()
    }
}, toastScript))