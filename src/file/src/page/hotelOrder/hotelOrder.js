// page/hotelOrder/hotelOrder.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");

Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {

    num:1,
    checksBox:{
      name:'条框', 
      value:'同意上善荣益旅居服务', 
      checked:false
    },
    is_action:false
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    var rooms = wx.getStorageSync('room_id')
    var count = wx.getStorageSync('monthsnum')
    var days = wx.getStorageSync('daysnum')
    var basename = wx.getStorageSync('itemname')
    var selectmonth = wx.getStorageSync('month')
    var selectday = wx.getStorageSync('day')
    var startmdate = wx.getStorageSync('startmdate')
    var endmdate = wx.getStorageSync('endmdate')
    var startdate = wx.getStorageSync('startdate')
    var enddate = wx.getStorageSync('enddate')

    var startFmdate = wx.getStorageSync('startFmdate')
    var endFmdate = wx.getStorageSync('endFmdate')
    var startFdate = wx.getStorageSync('startFdate')
    var endFdate = wx.getStorageSync('endFdate')

    var deposit_ratio = wx.getStorageSync('deposit_ratio')
    var base_time = wx.getStorageSync('base_time')

    //let userInfo = wx.getStorageSync('userInfo')
    
    if(rooms.month_fee==null){
       rooms.month_fee=0
    }
    if(rooms.price==null){
       rooms.price=0
    }
    //console.log(rooms.month_fee)
    var num=parseInt(this.data.num)
    var Mtotalprice=rooms.month_fee*num*count
    var Dtotalprice=rooms.price*num*days

    var Mptotalprice=rooms.month_fee*count
    var Dptotalprice=rooms.price*days
    
    // console.log(num)
    // console.log(rooms.month_fee*num*count)
    // console.log(rooms.price*num*days)

    if(selectmonth){
      var time_start=startmdate;
      var time_end=endmdate;
      var time_startf=startFmdate;
      var time_endf=endFmdate;
      var totalprice=Mtotalprice;
      var ptotalprice=Mptotalprice;
      var days=count*30
    }else{
       var time_start=startdate;
       var time_end=enddate;
       var time_startf=startFdate;
       var time_endf=endFdate;
       var totalprice=Dtotalprice;
       var ptotalprice=Dptotalprice;

    }
    
    var Depositprice=(totalprice*deposit_ratio).toFixed(2)
    var Balanceprice=(totalprice*(1-deposit_ratio)).toFixed(2);



    this.setData({
      id:options.id,
      rooms:rooms,
      count:count,
      days:days,
      basename:basename,
      selectmonth:selectmonth,
      selectday:selectday,
      //startmdate:startmdate,
      //endmdate:endmdate,
      startdate:time_start,
      enddate:time_end,
      startFdata:time_startf,
      endFdata:time_endf,
      deposit_ratio:deposit_ratio,
      base_time:base_time,
      totalprice:totalprice,
      ptotalprice:ptotalprice,
      Depositprice:Depositprice,
      Balanceprice:Balanceprice
    })
    
    this.WxValidate = app.wxValidate(
            {
                username: {
                    required: true,
                    minlength: 2,
                    maxlength: 10,
                },
                mobile: {
                    required: true,
                    tel: true,
                    //maxlength: 11,
                }
                
            }
            , {
                username: {
                    required: '请填写您的姓名',
                },
                mobile: {
                    required: '请填写您的手机',
                }
            }
        )
   },
  orderDetails(){
    wx.redirectTo({
      url:`/page/orderDetails/orderDetails`
    })
  },

  Agreement(){
    wx.navigateTo({
      url:`/page/agreement/agreement?id=${this.data.id}`
    })
  },

  addRoom(){
    // debugger
    var num=this.data.num;
    num++;
    num=parseInt(num);
    var totalprice=this.data.ptotalprice*num;
    var Depositprice=(totalprice*this.data.deposit_ratio).toFixed(2);
    var Balanceprice=(totalprice*(1-this.data.deposit_ratio)).toFixed(2);
    this.setData({
        num:num,
        totalprice:totalprice,
        Depositprice:Depositprice,
        Balanceprice:Balanceprice
    })
  },
  minRoom(){
    if(this.data.num == 1){
        this.toast('房间数不能小于１');
        return false
    }else{
      var num=this.data.num;
      num--;
      num=parseInt(num);
      var totalprice=this.data.ptotalprice*num;
      var Depositprice=(totalprice*this.data.deposit_ratio).toFixed(2)
      var Balanceprice=(totalprice*(1-this.data.deposit_ratio)).toFixed(2);
      this.setData({
          num:num,
          totalprice:totalprice,
          Depositprice:Depositprice,
          Balanceprice:Balanceprice
      })
    }
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

  //复选框
  // checkboxChange(e){
  //    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
     
  // },
  
  checkbox(e){
     var checked=e.currentTarget.dataset.check;
     this.data.checksBox.checked=!checked
     this.setData({
        checksBox:this.data.checksBox
     })
  },
  //表单提交
 formSubmit: function (e) {
    var that = this;
     
         if (!that.WxValidate.checkForm(e)) {
            const error = that.WxValidate.errorList[0]
            // `${error.param} : ${error.msg} `
            wx.showToast({
                title: `${error.msg} `,
                image: '/assets/img/tip.png',
                duration: 2000
            })
            return false
        }
        
        if(!that.data.checksBox.checked){
             wx.showToast({
                title: `请勾选服务协议`,
                image: '/assets/img/tip.png',
                duration: 2000
            })
           return false
        }
        var health_room_id=that.data.rooms.id;
        var room_num=that.data.num;
        var time_startf=that.data.startFdata;
        var time_endf=that.data.endFdata;
        var order_price=that.data.totalprice;
        var day_num=that.data.days;
        var truename=e.detail.value.username;
        var tel=e.detail.value.mobile;
        
        var is_action=this.data.is_action;
        console.log(is_action);
        if(is_action){
          return false;
        }
        is_action=true;
        this.setData({
          is_action:is_action
        })
          
        app.services('/api/v5/orders/submit_order',{
          data:{
            health_room_id:health_room_id,
            room_num:room_num,
            time_start:time_startf,
            time_end:time_endf,
            order_price:order_price,
            day_num:day_num,
            truename:truename,
            tel:tel
         },
         method: 'POST'
        }).then(res=>{

         console.log(res.data)
         is_action=false;
         this.setData({
            is_action:is_action
         })
         wx.redirectTo({
             url:`/page/orderDetails/orderDetails?order_sn=${res.data.order_sn}&room_pay_way=${this.data.rooms.room_pay_way}`     
           })
        },error=>{

          //console.log(res)
           this.toast('提交失败，请您稍后再试')
           is_action=false;
           this.setData({
              is_action:is_action
           })
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
},toastScript))