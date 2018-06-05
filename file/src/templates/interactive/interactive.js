function submit() { // 发表评论
    var that = this;
    var app = getApp();
    wx.createSelectorQuery().select('#comment-textarea').fields({
        properties: ['value']
    }, function(res) {

        var content = res.value;
        var userInfo = wx.getStorageSync('userInfo');
        // 提交评论
        var newList = that.data.commentList;
        var time = app.getTime(new Date());

        if (content != '') {
            wx.showLoading({
                title: '发表中...',
                mask: true
            })
            app.services('/api/v4/user_article_comments/create_comment', {
                data: {
                    content: content,
                    article_id: that.data.article_id,
                    atype: that.data.atype
                },
                method: 'POST'
            }).then(res => {
               wx.reportAnalytics('comment', {});
                newList.unshift({
                    created_at: time,
                    user_name: userInfo.truename,
                    user_avatar: userInfo.user_avatar,
                    content,
                });
                // 关闭评论框
                that.setData({
                    openConfirm: false,
                    comment_value: '',
                    'article_comments_count': that.data.article_comments_count + 1,
                    'commentList': newList
                })
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

function fixed() {

}

function closeConfirm() {
    // 关闭评论框
    this.setData({
        openConfirm: false
    })
}

function openConfirm() {
    // 我要评论

    this.setData({
        openConfirm: true
    })
}




function collectionClick() { // 收藏
    var app = getApp();
    var collection_status = this.data.is_collect;
    var that = this;
    if (collection_status == 0) {
        // 收藏
        that.setData({
            is_collect: 1
        })
        app.services('/api/v4/user_article_collections/collect_article', {
            data: {
                article_id: that.data.article_id,
                atype: that.data.atype
            },
            method: 'POST'
        }).then(res => {
            that.toast('收藏成功')

        }, error => {
            that.setData({
                is_collect: 0
            })
            that.toast('收藏失败')
        })
    } else {
        // 取消收藏
        that.setData({
            is_collect: 0
        })
        app.services('/api/v4/user_article_collections/cancel_collect', {
            data: {
                article_id: that.data.article_id,
                atype: that.data.atype
            }
        }).then(res => {

            that.toast('取消成功')

        }, error => {
            that.setData({
                is_collect: 1
            })
            that.toast('取消失败')
        })
    }
}

function like() { // 点赞
    var app = getApp();
    var userInfo = wx.getStorageSync('userInfo');
    var is_vote = this.data.is_vote;
    var votesList = this.data.votes;
    var that = this;

    if (is_vote == 0) {
        // 点赞
        votesList.unshift({
            user_avatar: userInfo.user_avatar,
            user_id: userInfo.id
        });
        that.setData({
            'votes': votesList,
            'article_votes_count': that.data.article_votes_count + 1,
            'is_vote': 1
        })
        app.services('/api/v4/user_article_votes/vote_article', {
            data: {
                article_id: that.data.article_id,
                atype: that.data.atype
            },
            method: 'POST'
        }).then(res => {
            that.toast('点赞成功')
        }, error => {
            let list = votesList.filter(item => {

                return item.user_id != userInfo.id
            })
            that.setData({
                'votes': list,
                'article_votes_count': that.data.article_votes_count - 1,
                'is_vote': 0
            })
            that.toast('点赞失败')

        })
    } else {
        let list = votesList.filter(item => {
            return item.user_id != userInfo.id
        })
        that.setData({
            'votes': list,
            'article_votes_count': that.data.article_votes_count - 1,
            'is_vote': 0
        })
        app.services('/api/v4/user_article_votes/cancel_vote', {
            data: {
                article_id: this.data.article_id,
                atype: this.data.atype
            }
        }).then(res => {



            that.toast('取消点赞')
        }, error => {
            that.toast('取消失败')

            votesList.unshift({
                user_avatar: userInfo.user_avatar,
                user_id: userInfo.id
            });
            that.setData({
                'votes': votesList,
                'article_votes_count': that.data.article_votes_count + 1,
                'is_vote': 1
            })
        })
    }
}

module.exports = {
    submit,
    fixed,
    closeConfirm,
    openConfirm,
    collectionClick,
    like
}