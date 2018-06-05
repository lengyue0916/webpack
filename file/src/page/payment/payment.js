// page/payment/payment.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    is_action:false,
    expireTime: "", 
    clock: ''
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
     //res.data.time_yes=app.globalData.moment(res.data.time_yes).format('YYYY-MM-DD  HH:mm');
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
         expireTime:res.data.time_yes,
         loading:false
      })
     
    },error=>{

     })

    this.setData({
      order_id:options.order_id,
    })
    //this.count_down(); 
    //console.log(this.data.clock);
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

  ordercancel(){
     var order_id=this.data.order_id;
    //  app.services('/api/v5/orders/order_cancel',{
    //   data:{
    //     order_id:order_id,
    //     update_type:0
    //   }
    // }).then(res=>{
    //  console.log(res.data);


    //    wx.redirectTo({
    //     //url:`/page/payCancel/payCancel?order_id=${this.data.order_id}`
    //     url:`/page/orderManage/orderManage`
    //   })
    // },error=>{

    //  })
    wx.showModal({
      title: '取消订单',
      content: '您确定取消订单吗？',
      success: function(res) {
        if (res.confirm) {
          　app.services('/api/v5/orders/order_cancel',{
              data:{
                order_id:order_id,
                update_type:0
              }
            }).then(res=>{
             console.log(res.data);


               wx.redirectTo({
                //url:`/page/payCancel/payCancel?order_id=${this.data.order_id}`
                url:`/page/orderManage/orderManage`
              })
            },error=>{

             })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  orderMara(){
    // wx.redirectTo({
    //   url:`/page/paySucess/paySucess?order_id=${this.data.order_id}`
    // })
    var that=this;
    var order_id=this.data.order_id;
    var pay_way=this.data.room_pay_way;
    var price;
     if(pay_way==1){
        price=(this.data.orderDes.order_price*this.data.orderDes.health_base.deposit_ratio).toFixed(1);
     }else if(pay_way==0){
        price=(this.data.orderDes.order_price*100/100).toFixed(1);
     }
    
     var is_action=this.data.is_action;
     console.log(is_action);
     if(is_action){
      return false
     }
     is_action=true;
     this.setData({
       is_action:is_action
     })
    //console.log("price"+price);
     app.services('/api/v5/orders/order_pay',{
          data:{
            order_id:order_id,
            fee:price
          }
        }).then(res=>{
           console.log(res);
          // console.log(res.data.timeStamp);
          // console.log(res.data.nonceStr)
          // console.log(res.data.package)
          // console.log(res.data.signType)
          // console.log(res.data.paySign)
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType:'MD5',
            paySign: res.data.paySign,
            success:function(res){
            console.log(res);
            app.services('/api/v5/orders/order_cancel',{
              data:{
                order_id:order_id,
                update_type:1
              }
            }).then(res=>{
             console.log(res.data)
            },error=>{

             })
             wx.showToast({
                title:'支付成功',
                icon:'success',
                duration:3000
                })
               wx.redirectTo({
                  url:`/page/paySucess/paySucess?order_id=${order_id}&pay_way=${pay_way}`
                }) 
            },
            fail:function(res){
            　//console.log(res);
             wx.showToast({
                title:'支付失败',
                image: '/assets/img/tip.png',
                duration:3000
                })
            },
            complete:function(res){
              console.log(res);

              is_action=false;
              that.setData({
                 is_action:is_action
                })
               }

            });
          
        },error=>{
           is_action=false;
             this.setData({
               is_action:is_action
            })
         })

  },

  /* 毫秒级倒计时 */  
  // count_down() {  
  //   var that = this  
  //   //2016-12-27 12:47:08 转换日期格式  
  //   //var a = that.data.expireTime.split(/[^0-9]/); 
  //   //console.log(a); 
  //   //截止日期：日期转毫秒  
  //   //var expireMs = new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);  
  //  // 倒计时毫秒
  //   var order_id=this.data.order_id;
  //   var expireTime=this.data.expireTime;
  //   //console.log(new Date());
  //   var expireMs=app.globalData.moment(expireTime).add(5,'hours').format('YYYY-MM-DD  HH:mm:ss')
    
  //   var duringMs =(new Date(expireMs)).getTime()-(new Date()).getTime();  
  //   // 渲染倒计时时钟  
  //   that.setData({  
  //     clock: '支付剩余时间:'+that.date_format(duringMs)  
  //   }); 

  //   //console.log(this.data.clock);
  //   var timer=null;

  //   if (duringMs <= 0) { 
  //     clearTimeout(timer);
  //     that.setData({  
  //       clock: "支付已截止，请重新下单"  
  //     });

  //    app.services('/api/v5/orders/order_cancel',{
  //             data:{
  //               order_id:order_id,
  //               update_type:0
  //             }
  //           }).then(res=>{
  //            console.log(res.data);
  //            wx.redirectTo({
  //               //url:`/page/payCancel/payCancel?order_id=${this.data.order_id}`
  //               url:`/page/orderManage/orderManage`
  //             })
  //           },error=>{

  //     })  
  //     // timeout则跳出递归  
  //     return;  
  //   }  
  //   timer=setTimeout(function () {  
  //     // 放在最后--
  //     duringMs -= 10;
  //     that.count_down();  
  //   }, 10)  
  // },  
  //  /* 格式化倒计时 */  
  // date_format(micro_second) {  
  //   var that = this  
  //   // 秒数  
  //   var second = Math.floor(micro_second / 1000);  
  //   // 小时位  
  //   var hr = Math.floor(second / 3600);  
  //   // 分钟位  
  //   var min = that.fill_zero_prefix(Math.floor((second - hr * 3600) / 60));  
  //   // 秒位  
  //   var sec = that.fill_zero_prefix(second % 60);// equal to => var sec = second % 60;  
  //   return hr + "小时" + min + "分" + sec + "秒";  
  // },  
  
  // /* 分秒位数补0 */  
  // fill_zero_prefix(num) {  
  //   return num < 10 ? "0" + num : num  
  // },
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
},toastScript))