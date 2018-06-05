// components/swiper-item/swiper-item.js
var app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        sliderList: {
            type: Object,
            value: {},
            observer: "updateList"
        },
        back: {
            type: Boolean,
            value: false,
            observer: "goTop"
        },
        currnetIndex: {
            type: Number,
            value: 0
        },
        loading: {
            type: Boolean,
            value: true,
        },
        list: {
            type: Array,
            value: [],
        }
    },
    data: {
        list: [],
        isImg: true,
        isDispare: true
    },

    ready() {

        this.timer = 700;
        this.initY = 60;
        this.animationPage1Top = wx.createAnimation({
            duration: 0,
            transformOrigin: "100% 100% 0"
        });
        this.animationPage1Bottom = wx.createAnimation({
            duration: 0,
            transformOrigin: "0 0 0"
        });
        this.animationPage2Top = wx.createAnimation({
            duration: 0,
            transformOrigin: "100% 100% 0"
        });
        this.animationPage2Top.rotateX(0).step()
        this.animationPage2Bottom = wx.createAnimation({
            duration: 0,
            transformOrigin: "0 0 0"
        });
        this.animationPage2Bottom.rotateX(0).step()
        this.setData({
            page1: {
                data: null,
                index: null,
                indexTop: 1,
                indexBottom: 1,
                status: true,
                animationTop: this.animationPage1Top.export(),
                animationBottom: this.animationPage1Bottom.export()
            },
            page2: {
                data: null,
                index: null,
                status: false,
                indexTop: 0,
                indexBottom: 0,
                animationTop: this.animationPage2Top.export(),
                animationBottom: this.animationPage2Bottom.export()
            }
        })
    },
    /**
     * 组件的方法列表
     */
    methods: {
        updateList(newVal) {
            if (!newVal) return false;
            if (newVal && newVal.list.length) {
                console.info('模板更新', newVal)
                this.setData({
                    'page1.data': newVal.list[newVal.index],
                    'page1.status': true,
                    'page1.index': newVal.index,
                })
            } else {
                newVal && console.info('模板更新为空', newVal)
            }
        },
        goInDetails(e) {
            let id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/page/inDetail/inDetail?id=' + id + '&search_status=' + 0
            })
        },
        goHeka(e){
            let id = e.currentTarget.dataset.id;
            wx.navigateTo({
                url: '/page/heka/heka?id='+id +'&search_status='+0
            })
        },
        /**
         * 翻页开始的初始值
         */
        touchstart(e) {
            this.moveStartY = e.touches[0].pageY;
        },
        touchmove(e) {
            // debugger
            if (this.isFlip) {
                this.moveStartY = e.touches[0].pageY;
                return false;
            }
            if (this.moveStartY - e.touches[0].pageY > 10) {
                this.getData("down")


            } else if (this.moveStartY - e.touches[0].pageY < -10) {
                this.getData("up")
            }
            if (this.flip_type == undefined) {
                return false
            }

            if (this.moveStartY - e.touches[0].pageY > 40) {

                this.isFlip = true
                this.flipUp()
            } else if (this.moveStartY - e.touches[0].pageY < -40) {
                this.isFlip = true
                this.flipDown()
            }
            console.log()
        },
        goTop(newVal) {
            var that  = this;
            if (newVal) {
                var params = {};
                if (this.data.page1.status) {
                    this.flip_type = 'up';
                    params['page2.indexTop'] = 0
                    params['page2.indexBottom'] = 2
                    params['page2.index'] = 0
                    this.animationPage2Top.rotateX(0).step()
                    this.animationPage2Bottom.rotateX(90).step()
                    params['page1.indexTop'] = 1
                    params['page1.indexBottom'] = 1
                    params['page2.animationTop'] = this.animationPage2Top.export()
                    params['page2.animationBottom'] = this.animationPage2Bottom.export()
                    params['page2.data'] = this.data.sliderList.list[params['page2.index']]
                } else {
                    this.flip_type = 'up';
                    params['page1.indexTop'] = 0
                    params['page1.indexBottom'] = 2
                    params['page1.index'] = 0
                    this.animationPage1Top.rotateX(0).step()
                    this.animationPage1Bottom.rotateX(90).step()
                    params['page2.indexTop'] = 1
                    params['page2.indexBottom'] = 1
                    params['page1.animationTop'] = this.animationPage1Top.export()
                    params['page1.animationBottom'] = this.animationPage1Bottom.export()
                    params['page1.data'] = this.data.sliderList.list[params['page1.index']]
                }
                this.setData(params, function() {
                    that.isFlip = true
                    setTimeout(function(argument) {
                        that.flipDown()
                        that.setData({
                            back:false
                        })
                    }, 200)
                })
            }
        },

        getData(flip_type, cp) {

            var params = {};
            if (this.data.page1.status) {
                if (flip_type == 'down') {
                    if (this.data.page1.index >= (this.data.sliderList.list.length - 1)) {
                        this.triggerEvent('error', { msg: '更多详情请到我的往期回顾查看' }, {})
                        this.flip_type = undefined;
                        return false
                    }
                    this.flip_type = flip_type;
                    params['page2.indexTop'] = 2
                    params['page2.indexBottom'] = 0
                    params['page2.index'] = this.data.page1.index + 1
                    this.animationPage2Top.rotateX(-90).step()
                    this.animationPage2Bottom.rotateX(0).step()
                } else {
                    if (this.data.page1.index <= 0) {
                        this.triggerEvent('error', { msg: '已经是第一页了' }, {})
                        this.flip_type = undefined;
                        return false
                    }
                    this.flip_type = flip_type;
                    params['page2.indexTop'] = 0
                    params['page2.indexBottom'] = 2
                    params['page2.index'] = this.data.page1.index - 1
                    this.animationPage2Top.rotateX(0).step()
                    this.animationPage2Bottom.rotateX(90).step()
                }
                params['page1.indexTop'] = 1
                params['page1.indexBottom'] = 1
                params['page2.animationTop'] = this.animationPage2Top.export()
                params['page2.animationBottom'] = this.animationPage2Bottom.export()
                params['page2.data'] = this.data.sliderList.list[params['page2.index']]
            } else {
                if (flip_type == 'down') {
                    if (this.data.page2.index >= (this.data.sliderList.list.length - 1)) {
                        this.triggerEvent('error', { msg: '更多详情请到我的往期回顾查看' }, {})
                        this.flip_type = undefined;
                        return false
                    }
                    this.flip_type = flip_type;
                    params['page1.indexTop'] = 2
                    params['page1.indexBottom'] = 0
                    params['page1.index'] = this.data.page2.index + 1
                    this.animationPage1Top.rotateX(-90).step()
                    this.animationPage1Bottom.rotateX(0).step()
                } else {
                    if (this.data.page2.index <= 0) {
                        this.triggerEvent('error', { msg: '已经是第一页了' }, {})
                        this.flip_type = undefined;
                        return false
                    }
                    this.flip_type = flip_type;
                    params['page1.indexTop'] = 0
                    params['page1.indexBottom'] = 2
                    params['page1.index'] = this.data.page2.index - 1
                    this.animationPage1Top.rotateX(0).step()
                    this.animationPage1Bottom.rotateX(90).step()
                }
                params['page2.indexTop'] = 1
                params['page2.indexBottom'] = 1
                params['page1.animationTop'] = this.animationPage1Top.export()
                params['page1.animationBottom'] = this.animationPage1Bottom.export()
                params['page1.data'] = this.data.sliderList.list[params['page1.index']]
            }

            this.setData(params, function() {
                cp && cp()
            })
        },
        touchDown() {
            var that = this;
            if (this.isFlip) {
                return false
            }
            this.getData("down", function() {
                that.isFlip = true
                setTimeout(function(argument) {
                    that.flipUp()
                }, 200)
            })
        },
        flipDown() {
            console.log('上一页')
            var params = {};
            if (this.data.page1.status) {
                this.animationPage1Top.rotateX(-90).step({
                    duration: this.timer / 2,
                    delay: 0
                })
                this.animationPage2Bottom.rotateX(0).step({
                    duration: this.timer / 2,
                    delay: this.timer / 2
                })
                params['page1.animationTop'] = this.animationPage1Top.export()
                params['page2.animationBottom'] = this.animationPage2Bottom.export()
            } else {
                this.animationPage2Top.rotateX(-90).step({
                    duration: this.timer / 2,
                    delay: 0
                })
                this.animationPage1Bottom.rotateX(0).step({
                    duration: this.timer / 2,
                    delay: this.timer / 2
                })
                params['page2.animationTop'] = this.animationPage2Top.export();
                params['page1.animationBottom'] = this.animationPage1Bottom.export();

            }
            var that = this;
            this.setData(params, function() {
                setTimeout(function() {
                    if (that.data.page1.status) {
                        that.setData({
                            "page1.status": false,
                            "page1.indexTop": 0,
                            "page1.indexBottom": 0,
                            "page2.status": true
                        }, function() {
                            that.triggerEvent('hiddenHobby', { index: that.data.page2.index }, {})
                        })
                    } else {
                        that.setData({
                            "page2.status": false,
                            "page2.indexTop": 0,
                            "page2.indexBottom": 0,
                            "page1.status": true
                        }, function() {
                            that.triggerEvent('hiddenHobby', { index: that.data.page1.index }, {})
                        })
                    }
                    that.isFlip = false;
                }, that.timer);
            })
        },
        flipUp() {
            console.log('下一页')
            var params = {};
            if (this.data.page1.status) {
                this.animationPage1Bottom.rotateX(90).step({
                    duration: this.timer / 2,
                    delay: 0
                })
                this.animationPage2Top.rotateX(0).step({
                    duration: this.timer / 2,
                    delay: this.timer / 2
                })

                params['page1.animationBottom'] = this.animationPage1Bottom.export()
                params['page2.animationTop'] = this.animationPage2Top.export();

            } else {
                this.animationPage2Bottom.rotateX(90).step({
                    duration: this.timer / 2,
                    delay: 0
                })
                this.animationPage1Top.rotateX(0).step({
                    duration: this.timer / 2,
                    delay: this.timer / 2
                })
                params['page2.animationBottom'] = this.animationPage2Bottom.export()
                params['page1.animationTop'] = this.animationPage1Top.export();
            }
            var that = this;
            this.setData(params, function() {
                setTimeout(function() {
                    if (that.data.page1.status) {
                        that.setData({
                            "page1.status": false,
                            "page1.indexTop": 0,
                            "page1.indexBottom": 0,
                            "page2.status": true
                        }, function() {
                            that.triggerEvent('hiddenHobby', { index: that.data.page2.index }, {})

                        })
                    } else {
                        that.setData({
                            "page2.status": false,
                            "page2.indexTop": 0,
                            "page2.indexBottom": 0,
                            "page1.status": true
                        }, function() {
                            that.triggerEvent('hiddenHobby', { index: that.data.page1.index }, {})
                        })
                    }
                    that.isFlip = false;
                }, that.timer);
            })

        }


    }
})