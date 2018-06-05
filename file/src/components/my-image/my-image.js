Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        src: {
            type: String,
            value: "",

        },
        mode: {
            type: String,
            value: ""
        }

    },
    ready() {
        var _that = this;
        var query = wx.createSelectorQuery().in(this)
        query.select('#my-image').boundingClientRect(function(rect) {
            let width = Math.ceil(rect.width);
            let height = Math.ceil(rect.height);
            _that.setData({
                thumbSrc: `${_that.data.src}?imageView2/1/w/${width}/h/${height}/q/10|imageslim`
            })
        }).exec()
    },
    methods: {

        _imgOnLoad(ev) {
            this.setData({
                isImg: true
            })
        }
    }
})