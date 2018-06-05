var app = getApp();
Component({
    properties: {
        item: {
            type: Object,
            value: {}
        },
        userId:{
            type: Number
        },
        index:{
            type:Number
        }
    },
    data: {
    	
    },
    created() {

    },
    ready(){
        var that = this;
        wx.createSelectorQuery().in(this).select('#cover_img').boundingClientRect(function(rect) {
            that.setData({
                width:rect.width
            })
       		
        }).exec()
    },
    methods: {
        // 跳转详情页
        detail(e){
            var item = this.data.item;
            wx.navigateTo({
                url:`/page/details/details?id=${item.id}&search_status=${item.search_status}`
            })
        },
        // 点击头像跳转
        person(){
            wx.navigateTo({
                url:`/page/attenDetail/attenDetail?id=${this.data.item.user_id}`
            })
        },
        // 关注
        focus() {
            app.services('/api/v4/user_wechat_focus/focus_user', { data: { follow_id: Number(this.data.item.user_id) }, method: 'POST' }).then(res => {
                this.setData({
                    is_focus: 1
                })
                this.triggerEvent('toast', {msg:'关注成功'}, {})

            }, error => {})
        },
        // 收藏
        collectionClick() { 
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
        },
        // 点赞
        like() {
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
       
    }
})
