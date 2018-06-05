// page/selImg/selImg.js
var movableArea, app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({
    data: {
        iscorp: false

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.showLoading({
            title: '读取图片...'
        });
        this.ctx = wx.createCanvasContext('myCanvas');
        var that = this;
        var stroge = new Promise((resolve, reject) => {
            wx.getStorage({
                key: "article_posts",
                success(res) {
                    resolve(res.data)
                },
                fail() {
                    reject();
                }
            });
        })
        var movableAreaQuery = new Promise((resolve, reject) => {
            wx.createSelectorQuery().select('#movableArea').boundingClientRect(rect => {
                resolve({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                })
            }).exec()
        })
        Promise.all([stroge, movableAreaQuery]).then(res => {
            that.form = res[0];
            movableArea = res[1];
            if (that.form.cover_img_data) {
                that.setData({
                    movable: that.form.cover_img_data
                }, () => {
                    that.initCanvas();
                })
            } else {
                wx.hideLoading();
                that.chooseImage();
            }
        }, error => {
            this.toast('工具初始化失败');
            setTimeout(() => {
                wx.navigateBack();
            }, 2000)
        })


    },
    touchstart(e) {
        // 两指（一指属于拖动，由movable-area组件完成，这里不再进行处理）
        if (e.touches.length > 1) {
            // 计算两指间的距离
            let xMove, yMove;

            //计算两指距离
            xMove = e.touches[0].x - e.touches[1].x
            yMove = e.touches[0].y - e.touches[1].y
            this.distance = Math.sqrt(xMove * xMove + yMove * yMove)
        }
    },
    /*
    用于缩放操作。
     */
    touchmove(e) {
        // 两指（一指属于拖动，由movable-area组件完成，这里不再进行处理）
        if (e.touches.length > 1) {
            // 计算两指间的距离
            let xMove, yMove, distance, scale, width, height, diffX, diffY;

            //计算两指距离
            xMove = e.touches[0].x - e.touches[1].x
            yMove = e.touches[0].y - e.touches[1].y
            distance = Math.sqrt(xMove * xMove + yMove * yMove);
            //  使用0.005的缩放倍数具有良好的缩放体验
            scale = this.data.movable.scale + 0.001 * 8 * (distance - this.distance);
            width = this.data.movable.width * scale;
            height = this.data.movable.height * scale;
            diffX = this.data.movable.x + ((this.data.movable.width - width) / 2);
            diffY = this.data.movable.y + ((this.data.movable.height - height) / 2);
            this.setData({
                'movable.scale': scale,
                'movable.width': width,
                'movable.height': height,
                'movable.x': diffX,
                'movable.y': diffY
            })
        }
    },
    touchend(e) {
        // 获取movable-view的相对页面的位置
        setTimeout(function() {
            var that = this
            wx.createSelectorQuery().select('#movableView').boundingClientRect(rect => {
                // console.log(rect.left - movableArea.left, rect.top - movableArea.top);
                that.setData({
                    'movable.x': rect.left - movableArea.left,
                    'movable.y': rect.top - movableArea.top,
                }, () => {
                    that.initCanvas();
                })
            }).exec()
        }.bind(this), 1000)

    },
    chooseImage() {
        if (this.data.iscorp) {
            this.setData({
                iscorp: false
            })
        }
        var that = this;
        wx.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(images) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                wx.showLoading({
                    title: '读取图片...'
                })

                wx.getImageInfo({
                    src: images.tempFilePaths[0],
                    success(res) {
                        let ratio = res.width / res.height;
                        let width = app.screenWidth;
                        let height = width / ratio;
                        let movable = {
                            src: images.tempFilePaths[0],
                            ratio,
                            width,
                            height,
                            x: (movableArea.width - width) / 2,
                            y: (movableArea.height - height) / 2,
                            _width: res.width,
                            _height: res.height,
                        }
                        that.setData({
                            movable
                        }, () => {
                            that.initCanvas();
                        })
                    }
                })

            },
            fail() {
                that.toast('图片选择失败');
            }
        })
    },
    initCanvas() {
        console.log(this.data.movable)
        this.ctx.drawImage(this.data.movable.src, this.data.movable.x, this.data.movable.y, this.data.movable.width, this.data.movable.height);
        this.ctx.draw();
        wx.hideLoading();
    },
    complete() {
        this.setData({
            iscorp: true
        })
        var that = this;
        setTimeout(function() {
            wx.canvasToTempFilePath({
                width: movableArea.width,
                height: movableArea.height,
                destWidth: movableArea.width,
                destHeight: movableArea.height,
                canvasId: 'myCanvas',
                success: function(res) {
                    if (!that.form.cover_img) {
                        that.form.article_contents.unshift({
                            content_type: 1,
                            content: "",
                            resource_url: that.data.movable.src,
                            id: 'article_contents_' + (that.form.article_contents.length + 1),
                            content_order: that.form.article_contents.length + 1
                        })
                    }
                    that.form.cover_img_data = that.data.movable;
                    console.log('裁剪图片成功，路径是：' + res.tempFilePath)
                    that.form.cover_img = res.tempFilePath;
                    that.setData({
                        iscorp: false
                    })
                    wx.setStorage({
                        key: 'article_posts',
                        data: that.form,
                        success() {
                            wx.navigateBack()
                        }
                    })
                },
                fail(error) {
                    console.log(error);
                    that.toast('裁图失败，将使用原图');
                    setTimeout(function() {
                        if (!that.form.cover_img) {
                            that.form.article_contents.unshift({
                                content_type: 1,
                                content: "",
                                resource_url: that.data.movable.src,
                                id: 'article_contents_' + (that.form.article_contents.length + 1),
                                content_order: that.form.article_contents.length + 1
                            })
                        }
                        that.form.cover_img_data = that.data.movable;
                        console.log('裁图失败，将使用原图，路径是：' + that.data.movable.src)
                        that.form.cover_img = that.data.movable.src;
                        that.setData({
                            iscorp: false
                        })
                        wx.setStorage({
                            key: 'article_posts',
                            data: that.form,
                            success() {
                                wx.navigateBack()
                            }
                        })
                    })
                }
            })
        }, 400)

    }

}, toastScript))