// components/tabs/tabs.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    addText:function(status){
      if(status.currentTarget.dataset.status == 'index'){
        wx.switchTab({
          url:"../index/index"
        })
      }else if(status.currentTarget.dataset.status == 'base'){
        
      }else if(status.currentTarget.dataset.status == 'read'){
        wx.switchTab({
          url:"../read/read"
        })
      }else{
         wx.switchTab({
          url:"../me/me"
        })
      }
    }
  }
})
