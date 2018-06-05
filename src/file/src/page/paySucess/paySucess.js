// page/paySucess/paySucess.js
var app = getApp();
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
    console.log(options.order_id);
     
    app.services('/api/v5/orders/order_details',{
      data:{
        order_id:options.order_id
      }
    }).then(res=>{
     console.log(res.data)
     this.setData({
         orderDes:res.data
      })
     
    },error=>{

     })

    this.setData({
      order_id:options.order_id,
      room_pay_way:options.pay_way
     
    })
  },
 

  orderMore(){
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
      url:`/page/paydetail/paydetail?order_id=${this.data.order_id}&pay_way=${this.data.room_pay_way}`,
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

   //拨打电话
  Calling(){
     wx.makePhoneCall({  
      phoneNumber: '4008-75-4008', //此号码并非真实电话号码，仅用于测试  
      success:function(){  
        console.log("拨打电话成功！")  
      },  
      fail:function(){  
        console.log("拨打电话失败！")  
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