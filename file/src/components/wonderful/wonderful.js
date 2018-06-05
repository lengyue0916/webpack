// components/wonderful/wonderful.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        item: {
            type: Object,
            value: {},
            observer: "updateItem"
        },
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        updateItem(newVal) {
            this.setData({
                item: newVal
            })
        },
        goDetail(e) {
            //查看详情
            var id = e.currentTarget.dataset.id;
            let search_status = 0;
            // 空间详情页
            wx.navigateTo({
                url:`/page/inDetail/inDetail?id=${id}&search_status=0`
            })


        }
    }
})