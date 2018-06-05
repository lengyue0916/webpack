// page/hotelOrder/hotelOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     is_action:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var order_sn=options.order_sn;
    var room_pay_way=options.room_pay_way;
    //console.log(order_sn)
    //console.log(room_pay_way)
    this.setData({
      order_sn:order_sn,
      room_pay_way:room_pay_way
    })
  },
  
  submit(){
    var that=this;
    var is_action=this.data.is_action;
     if(is_action) {
       return false
     }
    is_action=true;
    this.setData({
       is_action:is_action
    })
    wx.redirectTo({
      url:`/page/orderManage/orderManage`,
      success(){},
      fail(){},
      complete(){
        setTimeout(function(){
          is_action=false;
          that.setData({
             is_action:is_action
          })
        },1500)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})