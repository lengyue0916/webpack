// page/paydetail/paydetail.js
var app = getApp();
Page({

  data: {
    loading:true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.order_id);
    console.log(options.pay_way);
  	app.services('/api/v5/orders/order_details',{
  		data:{
  			order_id:options.order_id
  		}
  	}).then(res=>{
     console.log(res.data)
     res.data.time_end=app.globalData.moment(res.data.time_end).format('MMMDo');
     res.data.time_start=app.globalData.moment(res.data.time_start).format('MMMDo');
     res.data.created_at=app.globalData.moment(res.data.created_at).format('YYYY-MM-DD  HH:mm');
     res.data.time_pay=app.globalData.moment(res.data.time_pay).format('YYYY-MM-DD  HH:mm');
     if(options.pay_way==1){
        res.data.order_price=(res.data.order_price*100/100).toFixed(2);
        res.data.Depositprice=(res.data.order_price*res.data.health_base.deposit_ratio).toFixed(2);
        res.data.Balanceprice=(res.data.order_price*(1-res.data.health_base.deposit_ratio)).toFixed(2);  
     }else if(options.pay_way==0){
        res.data.order_price=(res.data.order_price*100/100).toFixed(2);
     } 
     
     this.setData({
         orderDes:res.data,
         room_pay_way:options.pay_way,
         loading:false
      })
     
    },error=>{

     })

    this.setData({
      
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
  }
})