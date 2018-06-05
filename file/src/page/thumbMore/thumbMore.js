var app = getApp();
const moment = require("../../assets/lib/moment");
Page({
    data: {
        commentList: {
            isEnd: false,
            data: []
        }
    },
    onLoad: function(options) {
        this.article_id = options.article_id;
        this.atype = options.atype;
        this.onPullDownRefresh();
    },
    onPullDownRefresh: function(e) { // 下拉刷新
        this.page = 1;
        // 获取文章所有点赞
        app.services('/api/v4/user_article_votes/all_voters', {
            data: {
                page: this.page,
                per_page: 10,
                article_id: this.article_id,
                atype: this.atype
            }
        }).then(res => {
            var comtist = res.data.article_votes;
            comtist.map((item, index) => {
                item.vote_time = app.getTime(item.vote_time);
            })
            this.setData({
                commentList: {
                    isEnd: res.data.article_votes.length < 10,
                    data: comtist
                },
                count: res.data.article_votes_count
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
            app.services('/api/v4/user_article_votes/all_voters', {
                data: {
                    page: this.page,
                    article_id: this.article_id,
                    atype: this.atype
                }
            }).then(res => {
                var comtist = res.data.article_votes;
                comtist.map((item, index) => {
                    item.vote_time = app.getTime(item.vote_time);
                })
                comtist = that.data.commentList.data.concat(comtist)

                that.setData({
                    commentList: {
                        isEnd: res.data.article_votes.length < 10,
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
    }
})