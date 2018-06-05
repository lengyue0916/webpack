// page/agreement/agreement.js
Page({
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      	id:options.id
    })
  },

  orderMore(){

  	 // wx.redirectTo({
  	 // 	url:`/page/hotelOrder/hotelOrder?id=${this.data.id}`
    //  })
     wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
     })
   }
})