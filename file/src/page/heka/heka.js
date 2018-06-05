var app = getApp();
Page({
	data: {
		loading: true
	},
	onLoad(options) {
		this.imagec = 0;
		this.userinfo = wx.getStorageSync('userInfo');
		if (options.scene) {
			let scene = decodeURIComponent(options.scene);
			scene = scene.split(',');
			options.id = scene[0];
			options.share_id = scene[3];
			this.setData({
				article_id: scene[0],
				search_status: scene[1],
				user_hobby_id: scene[2],
				share_id: scene[3],
				share_path: scene[4],
				username: scene[5],
				avtor: scene[6],
				content: scene[7],
				user_avatar: this.userinfo.user_avatar,
				usernick: this.userinfo.truename || this.userinfo.wx_name,
				sharenick:this.userinfo.truename || this.userinfo.wx_name,
				shareContent: scene[7]
			});
		} else {
			this.setData({
				article_id: options.id,
				search_status: 0,
				username: '上善荣益全体员工',
				avtor: '../../assets/img/logo.png',
				content: '新年新气象，事业步步高，财神福神对你笑，生活顺利处处好，狗年旺旺旺！',
				user_avatar: this.userinfo.user_avatar,
				usernick: this.userinfo.truename || this.userinfo.wx_name,
				sharenick:this.userinfo.truename || this.userinfo.wx_name,
				shareContent: '新年新气象，事业步步高，财神福神对你笑，生活顺利处处好，狗年旺旺旺！'
			});
		}

		app.server.getStatus().then(res => {
			if (options.share_id) {
				app.services('/api/v4/shares/click_share_topic', {
					data: {
						share_topic_id: Number(options.share_id)
					}
				}).then(rect => {

				})
			}
			
			this.getData(options, this.userinfo)
		})




		wx.playBackgroundAudio({
			dataUrl: 'https://wx.ezu365.cn/uploads/cddc75e0472dc2f829d0c7eff833fecb.mp3',
			fail(error) {
				console.log(error)
			}
		})
	},
	getData(options, userInfo) {
		var that = this;
		app.services('/api/v4/wechat_topics/get_article', {
			data: {
				wechat_topic_id: options.id,
				search_status: 0
			}
		}).then(res => {
			if (userInfo.user_hobby_id == null) {
				app.services('/api/v4/user_hobbies/update_hobby', {
					data: { user_hobby_id: res.data.article.user_hobby_id },
					method: 'POST'
				}).then(res => {
					userInfo.user_hobby_id = res.data.article.user_hobby_id;
					userInfo.user_hobby = res.data.article.user_hobby_name;
					wx.setStorage({
						key: "userInfo",
						data: userInfo
					})
				}, error => {
					console.log('提交失败');

				})
			}
			
			that.setData({
				id:options.id,
				cover_img: res.data.article.cover_img,
				user_hobby_id: res.data.article.user_hobby_id,
				user_hobby: res.data.article.user_hobby_name
			})

		}, error => {
			this.setData({
				loading: false
			})

			this.toast(error.data.error)
		})
	},
	sharecard() {
		var that = this;
		if (!this.data.modal) {
			app.services('/api/v4/shares/add_share', {
				data: {
					wechat_topic_id: this.data.id
				}
			}).then(rect => {
				that.share_id = rect.data.id
				this.setData({
					modal: true
				})
			}, error => {
				that.share_id = undefined;

			})
		} else {
			this.setData({
				modal: !this.data.modal
			})
		}

	},
	imagecount() {
		this.imagec++;
		if (this.imagec >= 11) {
			console.log('图片全部加载完毕');
			setTimeout(function() {
				this.setData({
					loading: false
				})
			}.bind(this), 600)

		}


	},
	getname(e) {
		if (e.detail.value == '') {
			this.setData({
				sharenick: this.userinfo.truename || this.userinfo.wx_name
			})
		} else {
			this.setData({
				sharenick: e.detail.value
			})
		}

	},
	getcontent(e) {
		if (e.detail.value == '') {
			this.setData({
				shareContent: this.data.content
			})
		} else {
			this.setData({
				shareContent: e.detail.value
			})
		}

	},
	onShareAppMessage: function() {
		var that = this;
		var scene = this.data.article_id + ',' + 0 + ',' + this.data.user_hobby_id + ',' + that.share_id + ',' + '/page/heka/heka' + ',' + this.data.sharenick + ',' + this.userinfo.user_avatar + ',' + this.data.shareContent;
		return {
			title: `${this.data.usernick}给您分享了一张新年贺卡`,
			imageUrl: that.data.cover_img+'!shareCard',
			path: '/page/index/index?scene=' + scene,
			success: function(res) {
				wx.showToast({
					title: "分享成功",
					duration: 2000
				});
				that.setData({
					modal: !that.data.modal
				})
			}
		}
	},
	onUnload() {
		wx.stopBackgroundAudio();
	}
})