var app = getApp();
Component({
    properties: {
        data: {
            type: Object,
            value: {},
        },
        shareModal: {
            type: Boolean,
            value: false,
            observer: 'updateWxModal'
        }
    },
    data: {
        showCanvas: false,
        showSheet: false
    },

    methods: {
        updateWxModal(newVal) {
            newVal && console.log('打开了分享');
            !newVal && console.log('关闭了分享');
            if (newVal) {
                this.setData({
                    showCanvas: false,
                    showSheet: true,
                    draw_status: 1
                })

            } else {
                this.setData({
                    showCanvas: false,
                    showSheet: false
                })
            }
        },
        onTap() {
            console.log('此函数只是为了阻止冒泡')
        },
        closeHandle() {
            this.setData({
                shareModal: false
            })
        },

        /*
         *分享到朋友圈
         */
        shareHandle() {
            var that = this;
            wx.showLoading({
                title: "请稍后..."
            })
            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.record']) {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success() {
                                // 用户已经同意小程序使用存储到相册权限
                                getShareData()
                            },
                            fail() {
                                wx.hideLoading()
                                that.triggerEvent('error', { msg: '分享失败,您拒绝了分享所需权限' }, {})
                            }
                        })
                    } else {
                        // 用户已经同意小程序使用存储到相册权限
                        getShareData()
                    }
                },
                fail() {
                    wx.hideLoading()
                    that.triggerEvent('error', { msg: '分享失败,您拒绝了分享所需权限' }, {})
                }
            })
            //获取分享信息及绘图canvas信息；
            function getShareData() {

                that.setData({
                    showCanvas: true,
                    showSheet: false,
                    draw_status: 0
                })
                // 创建 canvas 绘图上下文
                that.context = wx.createCanvasContext('myCanvas', that);
                //获取canvasde的宽高
                var canvasQuery = new Promise(function(resolve, reject) {
                    wx.createSelectorQuery().in(that).select('#friend').boundingClientRect(function(rect) {
                        if (rect) {
                            resolve({
                                width: rect.width,
                                height: rect.height
                            })
                        } else {
                            reject({
                                errMsg: '分享失败'
                            });
                        }

                    }).exec()
                });
                // 获取二维码url
                var qrCode = new Promise(function(resolve, reject) {
                    app.services('/api/v4/common/create_qrcode', {
                        method: "POST",
                        data: {
                            // page: that.data.data.path,
                            page: 'page/index/index',
                            width: 20,
                            scene: that.data.data.article_id + ',' + that.data.data.search_status + ',' + that.data.data.user_hobby_id,
                        }
                    }).then(res => {
                        wx.downloadFile({
                            url: app.server.host + res.data.path,
                            success(res) {
                                //下载二维码的临时路径
                                resolve({
                                    qrCode_url: res.tempFilePath
                                })
                            },
                            fail() {
                                // 下载二维码失败
                                reject({
                                    errMsg: '获取二维码失败'
                                })
                            }
                        })
                    })
                })

                // 获取封面图
                var cover_img = new Promise(function(resolve, reject) {
                    wx.downloadFile({
                        url: that.data.data.cover_img,
                        success(res) {
                            resolve({
                                cover_img: res.tempFilePath
                            })
                        },
                        fail(e) {
                            reject({
                                errMsg: '获取封面失败'
                            })
                        }
                    })
                })
                Promise.all([canvasQuery, qrCode, cover_img]).then(res => {
                    var data = Object.assign(res[0], res[1], res[2]);
                    drawCanvas(data)
                }, error => {
                    wx.hideLoading();
                    that.setData({
                        showCanvas: false,
                        showSheet: true,
                        draw_status: 0
                    })
                    that.triggerEvent('error', { msg: error.errMsg }, {})
                })

            }

            function toLine(width, val) {
                var line_count = parseInt((width - 16 + 1) / 14);
                var line = [];
                val = val.split('');　

                var reg = /[\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300D|\u300F|\u2019|\u201D|\uFF09|\u3015|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300B|\u3009]/;
                do {
                    if (reg.test(val[line_count])) {
                        line.push(val.splice(0, line_count + 1).join(''));
                    } else {
                        line.push(val.splice(0, line_count).join(''));
                    }

                } while (val.length > 0)
                return line
            };

            function drawCanvas(data) {
                // 绘制白色背景
                console.info('分享参数', data);
                that.context.setFillStyle('#ffffff');
                that.context.fillRect(0, 0, data.width, data.height);
                // 绘制封面图；
                var top = 150;
                that.context.drawImage(data.cover_img, 0, 0, data.width, top);
                // 设置字体大小颜色
                that.context.setFontSize(14);
                that.context.setFillStyle('#000000');
                top += 5;
                that.context.setTextBaseline('top')
                var title_sub = toLine(data.width, that.data.data.title);
                title_sub.map((str) => {
                    that.context.fillText(str, 8, top);
                    top += 23
                })
                top += 2
                that.context.setFontSize(12);
                that.context.setStrokeStyle('#bdbdbd');
                that.context.moveTo(5, top);
                that.context.lineTo(data.width - 10, top);
                that.context.stroke();
                top += 15
                var bottom = data.height - top - 8;

                let diff = (bottom - 22 - 8 * 12) / 2;
                var qr_left = data.width - bottom + 19 + diff;
                let qr_width = bottom - 50;
                // 绘制二维码

                that.context.drawImage(data.qrCode_url, qr_left, top, qr_width, qr_width);
                // 绘制右下角文字
                that.context.setTextAlign('center');
                that.context.setTextBaseline('bottom');
                that.context.setFillStyle('#828282');
                that.context.fillText('长按识别小程序码', qr_left + qr_width / 2, top + bottom - 15);
                that.context.fillText('阅读更多精彩内容', qr_left + qr_width / 2, top + bottom);

    

                top = top + (bottom - 60) / 2;
                that.context.setTextAlign('left');
                that.context.setTextBaseline('top');
                that.context.fillText('就', 15, top);
                that.context.fillText('喜', 15, top + 20);
                that.context.fillText('欢', 15, top + 40);

                that.context.fillText('喜欢是一种态度', 40, top + 10);
                that.context.fillText('更是一种追求', 45, top + 30);
                that.setData({
                    draw_status: 1
                })
                if (app.SDKVersion.replace(/\./g, '') >= 174) {
                    that.context.draw(true, function() {
                        // 绘制完成,存储图片
                        exportShare()
                    });
                } else {
                    that.context.draw();
                    setTimeout(function() {
                        exportShare()
                    }, 800);

                }
            }
            function exportShare() {
                wx.canvasToTempFilePath({
                    canvasId: 'myCanvas',
                    quality: 1,
                    success: function(res) {
                        console.log(res.tempFilePath);
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success(res) {
                               
                                wx.hideLoading()
                            },
                            fail(error) {
                                console.log(error)
                                wx.hideLoading();
                                that.setData({
                                    showCanvas: false,
                                    showSheet: true,
                                    draw_status: 0
                                })
                                that.triggerEvent('error', { msg: '图片保存失败' }, {})
                            }
                        })
                    },
                    fail(error) {
                        wx.hideLoading();
                        that.setData({
                            showCanvas: false,
                            showSheet: true,
                          
                        })
                        that.triggerEvent('error', { msg: '图片保存失败' }, {})
                    }
                }, that)
            }
        }

    }
})