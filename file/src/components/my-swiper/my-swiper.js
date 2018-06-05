// components/swiper/swiper.js
const app = getApp();
Component({
    properties: {
        swiperList: {
            type: Array,
            value: [],
            observer: 'updateList'
        },
        width: {
            type: Number,
            value: 140,
            observer: 'updateWidth'
        }
    },
    attached() {
        this.left = 0;
        this.step = app.windowWidth / 2;
        this.slider_status = false;
        this.animation = wx.createAnimation({
            duration: 0,
            timingFunction: 'ease',
        })
        this.animation.translate(this.left).step()
        this.setData({
            animationData: this.animation.export()
        })
    },
    /**
     * 组件的方法列表
     */
    methods: {
        updateWidth(newVal) {
            this.setData({
                width: newVal
            })
        },
        updateList(newVal) {
            if (newVal.length <= 0) return false
            var that = this;
            this.setData({
                swiperList: newVal,
                current:0
            }, () => {
                that.move()
            })
        },
        touchstart(e) {
            this.startLeft = e.touches[0].pageX
        },

        touchmove(e) {
            if (!this.slider_status) {
                this.startLeft = e.changedTouches[0].pageX
                return false;
            }
            if (e.changedTouches[0].pageX - this.startLeft > 30) {
                this.slider_status && this.back()
            } else if (e.changedTouches[0].pageX - this.startLeft < -30) {
                this.slider_status && this.forward();
            }
        },

        move() {
            var id = this.data.swiperList[this.data.current].id;
            this.slider_status = false
            this.left = (app.windowWidth - this.data.width) / 2 - this.data.width * this.data.current
            this.animation.translate(this.left).step({
                duration: 600,
            })
            var that = this;
            this.setData({
                animationData: this.animation.export()
            }, () => {
                setTimeout(() => {
                    that.slider_status = true;
                }, 600)
            })
        },
        forward() {
            var that = this;
            if (this.data.swiperList.length - 1 > this.data.current) {
                this.setData({
                    current: this.data.current + 1
                }, () => {
                    that.move()
                })
            } else {
                //已经到最后了
                console.log('已经到最后了');
                this.triggerEvent('end', { msg: '已经没有更多了' }, {})
            }
        },
        back() {

            var that = this;
            if (this.data.current > 0) {
                this.setData({
                    current: this.data.current - 1
                }, () => {

                    that.move()
                })
            } else {
                //已经在最前面了
                console.log('已经在最前面了');

                this.triggerEvent('end', { msg: '已经没有更多了' }, {})

            }

        },
        orderSub(e) {
            var that = this;
            app.services('/api/v4/journals/sub_journal',{
                data:{ journal_id: e.currentTarget.dataset.id},method:'POST'
            }).then(res=>{
                if(res.data.status=='ok'){
                    that.triggerEvent('end',{msg:'期刊订阅成功'})
                }
            })
        },
        read(e){
            wx.navigateTo({
                url:`/page/column/column?id=${e.currentTarget.id}&name=${e.currentTarget.dataset.name}&type=columns`
            })
        }

    }
})