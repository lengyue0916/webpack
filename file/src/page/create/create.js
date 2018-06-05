// page/create/create.js
const app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

    /**
     * 页面的初始数据
     *title(String):文章标题
     *cover_img(String):封面图片地址路径
     *bg_img_id(Integer):背景图片ID
     *bg_music_id(Integer):背景音乐ID
     *desc(Integer):模板ID
     *article_contents(Array):
     *content(Text):文字内容
     *resource_url(String):资源(图片,音频,视频)地址
     *content_type(Integer):内容类型(0:纯文字;1:图文;2:音频文字;3:视频文字)
     *content_order(Integer):排序序号(从1开始)
     */
    data: {
        exitVideo: false, //是否存在视频
        exitRecord: false, //是否存在语音
        showRecord: false,
        current_contents: 1
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        this.type = options.type
        wx.getStorage({
            key: "type",
            success(res) {
                wx.removeStorage({
                    key: 'article_posts',
                    success: function(res) {
                        next()
                        console.log('缓存已经清除')
                    }
                })
                wx.removeStorage({
                    key: 'current_contents',

                })
                wx.removeStorage({
                    key: 'type',

                })

            },
            fail() {
                next()
            }

        });
        
        var that = this;
        

        function next() {

            that.onShow();
            if (options.type == 'create') {
                wx.setNavigationBarTitle({ title: '就喜欢-创作' });

            } else if (options.type == 'edit') {
                wx.setNavigationBarTitle({ title: '就喜欢-编辑' });
                wx.setStorage({
                    key: "type",
                    data: options.type
                });
                
                app.services('/api/v4/user_articles/get_article', {
                    data: {
                        user_article_id: options.id,
                        search_status: 0
                    }
                }).then(function(res) {
                    res.data.article.user_article_id = options.id
                    res.data.article.article_contents = res.data.article_contents
                    res.data.article.article_contents.map(function(item, index) {
                        item.id = "article_contents_" + item.id;
                        if (item.content_type == 2) {
                            console.log('开始下载');
                            (function(index) {
                                var url = res.data.article.article_contents[index].resource_url;
                                wx.downloadFile({
                                    url: url,
                                    success(rec) {
                                        console.log('下载成功');
                                        item.resource_url = rec.tempFilePath;
                                        item.status ='done';
                                        next()
                                    },
                                    fail(error) {
                                        next()
                                        console.log('下载失败');

                                    }
                                });
                            })(index);
                        } else {
                            next()
                        }
                    });

                    function next() {

                        that.setData({
                            form: res.data.article
                        })
                        wx.setStorage({
                            key: "article_posts",
                            data: res.data.article
                        });
                    }





                }, function(error) {
                    console.log('文章详情获取失败（编辑）')
                });
            }
        }
    },
    /**
     * 打开添加背景音乐页面
     */
    addMusic() {
        wx.navigateTo({
            url: "/page/musicList/musicList"
        })
    },
    addText() {
        var that = this;
        wx.vibrateShort();
        let list = this.data.form.article_contents;
        var addAnimate = wx.createAnimation({
            duration: 0,
            timingFunction: 'ease',
        });
        addAnimate.scale(.6).opacity(0).step();
        var item = {
            content_type: 0,
            content: "",
            resource_url: null,
            id: 'article_contents_' + (list.length + 1),
            content_order: list.length + 1,
            animationData: addAnimate.export()
        }
        list.push(item)
        var index = list.length - 1;
        setTimeout(function() {
            let params = {};
            addAnimate.scale(1).opacity(1).step({
                duration: 120
            });
            params['form.article_contents[' + index + '].animationData'] = addAnimate.export();
            this.setData(params)
        }.bind(this), 0)
        this.setData({
            'form.article_contents': list,
            'current_contents': list.length
        }, function() {
            that.scrollTo(item.id)
        })
    },
    editText(e) {
        var item = e.currentTarget.dataset.item;
        var current_contents = e.currentTarget.dataset.index + 1;
        this.setData({
            current_contents
        }, function() {

            if (item.content_type == 0 || item.content_type == 1) {
                // debugger
                wx.navigateTo({
                    url: '/page/create_tuwen/create_tuwen?order=' + item.content_order + "&index=" + e.currentTarget.dataset.index
                })
            } else if (item.content_type == 2) {
                wx.navigateTo({
                    url: '/page/create_record/create_record?order=' + item.content_order + "&index=" + e.currentTarget.dataset.index
                })
            } else if (item.content_type == 3) {
                wx.navigateTo({
                    url: '/page/create_video/create_video?order=' + item.content_order + "&index=" + e.currentTarget.dataset.index
                })
            }

        })
    },
    addPicture() {
        wx.vibrateShort();
        var that = this;
        this.addMedia = true;
        wx.chooseImage({
            count: 9,
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                var list = that.data.form.article_contents;
                var len = list.length
                res.tempFilePaths.map(image => {
                    var item = {}
                    list.push({
                        content_type: 1,
                        content: "",
                        resource_url: image,
                        id: 'article_contents_' + (list.length + 1),
                        content_order: list.length + 1
                    })
                });

                that.setData({
                    'form.article_contents': list,
                    'current_contents': len + 1
                }, function() {
                    wx.setStorage({
                        key: "article_posts",
                        data: that.data.form,
                        success() {
                            that.addMedia = false;
                            that.scrollTo('article_contents_' + list.length)
                        }
                    })

                })
            },
            fail() {
                that.addMedia = false;
                console.log('添加图片失败或取消');
            }
        })
    },
    addRecord() {
        wx.vibrateShort();
        var that = this;
        var list = that.data.form.article_contents;
        //检查是否存在录音，如果有录音则不能再继续添加；
        var records = list.filter(item => {
            return item.content_type == 2;
        })
        if (records.length >=5) {
            this.toast('最多只能添加5个录音哦');
            return false;
        }
        wx.getSetting({
            success(orize) {
                if (!orize.authSetting['scope.record']) {
                    wx.authorize({
                        scope: 'scope.record',
                        success(res) {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            next()

                        },
                        fail() {
                            that.toast('没有录音权限');

                        }
                    })
                } else {                    
                    next()
                }

            },
            fail() {
                console.log('检查授权异常')
            }
        })


        function next() {

            var record = {
                content_type: 2,
                content: "",
                resource_url: '',
                status: "start",
                id: 'article_contents_' + (list.length + 1),
                content_order: list.length + 1
            }
            list.push(record);
            that.setData({
                'form.article_contents': list,
                'current_contents': list.length
            }, function() {
                that.scrollTo(record.id);
                wx.navigateTo({
                    url: "../create_record/create_record?order=" + record.content_order + "&index=" + (list.length - 1)
                })
            })
        }

    },
    /**
     * 块调整顺序
     */
    sortClick(e) {
        var that = this;
        var cur_index = e.currentTarget.dataset.index;
        var pre_index = cur_index - 1;
        let param = {};

        var cur_id = this.data.form.article_contents[cur_index].id;

        var pre_id = this.data.form.article_contents[pre_index].id;





        param['form.article_contents[' + cur_index + '].sortBtn'] = true;
        this.setData(param);
        //获取上一个节点信息
        var pre_node = new Promise((resolve, reject) => {
            if (pre_id && pre_id !== '') {
                wx.createSelectorQuery().select('#' + pre_id).boundingClientRect(function(rect) {
                    resolve({
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height
                    })
                }).exec()
            } else {
                reject({

                    pre_index,
                    pre_id
                })
            }

        })
        //获取当前节点信息
        var cur_node = new Promise((resolve, reject) => {
            if (cur_id && cur_id !== '') {
                wx.createSelectorQuery().select('#' + cur_id).boundingClientRect(function(rect) {
                    resolve({
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height
                    })
                }).exec()
            } else {
                reject({
                    cur_index,
                    cur_id,

                })
            }

        })
        var nodes = [pre_node, cur_node];
        var goPre, goNext;
        Promise.all(nodes).then(res => { //两个节点信息全部获取成功，
            goPre = wx.createAnimation({
                duration: 400,
                timingFunction: 'ease',
            })
            goNext = wx.createAnimation({
                duration: 400,
                timingFunction: 'ease',
            })

            let bottom = 50 + res[1].height;
            let top = 50 + res[0].height;
            goPre.translate3d(0, -top, 15).step();
            goNext.translate3d(0, bottom, -15).step();
            let param = {};
            param['form.article_contents[' + cur_index + '].animationData'] = goPre.export();
            param['form.article_contents[' + pre_index + '].animationData'] = goNext.export();
            this.setData(param);

            setTimeout(function() {
                cp()
            }, 400);
        }, error => { //节点信息获取失败
            console.error(error)
            cp()
        })

        function cp() {
            goPre.translate3d(0, 0, 0).step({
                duration: 0,
                timingFunction: "step-start"
            });
            goNext.translate3d(0, 0, 0).step({
                duration: 0,
                timingFunction: "step-start"
            });
            let list = that.data.form.article_contents;
            list[cur_index].animationData = goPre.export();
            delete list[cur_index].sortBtn;
            list[pre_index].animationData = goNext.export();
            let cur_order = list[cur_index].content_order;
            let pre_order = list[pre_index].content_order;
            // debugger
            list[cur_index].content_order = pre_order;
            list[pre_index].content_order = cur_order;
            list.sort((a, b) => {
                return a.content_order - b.content_order;
            });
            that.setData({
                'form.article_contents': list
            })
        }
    },
    /**
     * 浏览图片
     */
    browseImage(e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src, // 当前显示图片的http链接
            urls: [src] // 需要预览的图片http链接列表
        })
    },

    deleteItem(event) {
        // console.log(event);
        var that = this;
        let index = event.currentTarget.dataset.index;
        let list = this.data.form.article_contents;

        list.splice(index, 1);
        let params = {
            'form.article_contents': list,
            'current_contents':index
        }
        
        
        this.setData(params)

    },


    /**
     * 根据输入的内容切换保存按钮和获取视频按钮;
     */
    netVideoInput(e) {
        this.inputValue = e.detail.value;
        if (this.inputValue != '') {
            this.setData({
                saveVideo: false
            });
        } else {
            this.setData({
                saveVideo: true
            });
        }
    },
    /**
     * 添加网络视频;
     */
    saveVideoLink() { // 保存网络视频链接
        var that = this;
        if (this.inputValue != '') {
            var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
            if (!reg.test(this.inputValue)) {
                wx.showToast({
                    title: "请输入正确的视频链接",
                    icon: "error",
                    duration: 2000

                });
                return false;
            } else {
                // 帖子配视频
                let list = this.data.form.article_contents;
                list.push({
                    content_type: 3,
                    content: '',
                    resource_url: this.inputValue,
                    id: 'article_contents_' + (list.length + 1),
                    content_order: list.length + 1
                })
                this.setData({
                    showVideo: false,
                    exitVideo: true,
                    'form.article_contents': list
                }, function() {
                    that.scrollBottom();
                })
            }
        }
    },
    /**
     * 添加本地视频;
     */
    addVideo: function() { // 获取本地视频
        wx.vibrateShort();
        var that = this;
        var list = that.data.form.article_contents;
        //检查是否存在录音，如果有录音则不能再继续添加；
        var records = list.filter(item => {
            return item.content_type == 3;
        })
        if (records.length > 0) {
            this.toast('只能添加一个视频哦');
            return false;
        }
        this.addMedia = true;
        wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            compressed: true,
            camera: ['front', 'back'],
            success(res) {

                // 帖子配视频
                let list = that.data.form.article_contents;
                var video = {
                    content_type: 3,
                    content: '',
                    resource_url: res.tempFilePath,
                    id: 'article_contents_' + (list.length + 1),
                    content_order: list.length + 1
                }
                list.push(video);

                that.setData({
                    'form.article_contents': list,
                    'current_contents': list.length
                }, function() {
                    wx.setStorage({
                        key: "article_posts",
                        data: that.data.form,
                        success() {
                            that.addMedia = false;
                            that.scrollTo(video.id);
                        }
                    })

                })
            },
            fail(error) {
                that.addMedia = false;
                console.log('添加视频失败或取消');
            }
        })



    },
    /**
     * 关闭ActionSheet
     */
    closeVideo() {
        this.setData({
            showVideo: false
        })
    },
    videoActionSheet: function() {
        wx.vibrateShort();
        this.setData({
            showVideo: true,
            saveVideo: true
        })
    },
    /**
     * 播放录音
     */
    playRecord: function(index) {
        if (this.data.exitVideo) { //如果存在视频则暂停播放视频
            wx.createVideoContext('myVideo').pause();
        }
        var that = this,
            item = this.data.form.article_contents[index];
        wx.playVoice({
            filePath: item.resource_url,
            success() {
                console.log('播放完了')
                let param = {};
                param['form.article_contents[' + index + '].status'] = 'done';
                that.setData(param);
            }
        })

    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
        if (this.addMedia) {
            return false;
        }
        wx.getStorage({
            key: "article_posts",
            success(res) {

                that.setData({
                    form: res.data
                })


            },
            fail() {
                that.setData({
                    form: {
                        title: '', //文章标题String
                        cover_img: '', //封面图片地址路径String
                        desc: 'default', //模板IDInteger
                        article_contents: []
                    }
                })
            }
        })
        wx.getStorage({
            key: "current_contents",
            success(res) {

                that.setData({
                    current_contents: res.data
                })

            },
            fail() {
                that.setData({
                    current_contents: 1
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        var that = this;
        wx.setStorage({
            key: "article_posts",
            data: that.data.form
        })
        wx.setStorage({
            key: "current_contents",
            data: that.data.current_contents
        })
    },


    /**
     * 下一步，前往预览页面
     */
    check_article_contents() {
        let list = this.data.form.article_contents.filter(item => {
            return item.content_type == 0 && item.content == '';
        })
        return list.length
    },
    check_article_url() {
        let urls = this.data.form.article_contents.filter(item => {
            return item.content_type == 2 && item.resource_url == '';
        })
        return urls.length
    },
    next(e) {
        if (this.data.form.title == '') {

            this.toast('请输入标题')
            return false;
        } else if (this.check_article_contents() > 0) {

            this.toast('文字版块内容不能为空')
            return false;
        } else if (this.check_article_url() > 0) {

            this.toast('您还没有录音呢')
            return false;
        }
        if (this.data.form.cover_img && this.data.form.cover_img != '') {
            wx.navigateTo({
                url: "/page/preview/preview?type=" + this.type
            })

        } else {
            this.toast('请先选择封面图')


        }


    },
    scrollCurrent() {
        var item = this.data.form.article_contents[this.data.current_contents - 1];
        this.setData({
            scrollToID: item.id
        })
    },
    scrollTo(id) {
        this.setData({
            scrollToID: id
        })
    },
    onUnload() {
        if (this.type == 'edit') {
            wx.removeStorage({
                key: 'article_posts',
                success: function(res) {
                    console.log('缓存已经清除')
                }
            })
            wx.removeStorage({
                key: 'current_contents',

            })
        }
    }



}, toastScript))