// components/myVideo/myVideo.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        poster: {
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: 'upDatePoster' // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        },
        src: {
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
            observer: 'upDateSrc' // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        status: "loading"
    },
    ready() {
        var that = this;
        var query = wx.createSelectorQuery().in(this)
        query.select('#video_poster').boundingClientRect(function(res) {
            that.setData({
                width: res.width,
                height: res.width * 9 / 16,
            })
        }).exec()
    },
    /**
     * 组件的方法列表
     */
    methods: {
        upDatePoster(newVal) {
            var that = this;

            wx.getImageInfo({
                src: newVal,
                success: function(res) {
                    that.video_width = res.width;
                    that.video_height = res.height;
                    that.setData({
                        status: 'ok'
                    })
                },
                fail() {
                    that.setData({
                        status: 'error'
                    })
                }
            })
        },

        video() {
            let src = encodeURIComponent(this.data.src);
            wx.navigateTo({
                url: `/page/video_play/video_play?src=${src}`
            })

        }
    }
})