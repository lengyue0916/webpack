// page/orderManage/orderManage.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

	/**
   * 页面的初始数据
   */
  data: {
    activeIndex: 0,
    tab:[{
      id:0,
      title:'全部',
      status:''
     },{
      id:1,
      title:'待确认',
      status:0
     },{
      id:2,
      title:'待支付',
      status:1
     },{
      id:3,
      title:'已支付',
      status:2
     },{
      id:4,
      title:'已取消',
      status:3
    }],
    status:[0,1,2,3,4],
    loading: true,
    is_action:false
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

   //console.log(this.data.status);

   app.services('/api/v5/orders/order_list').then(res=>{
     console.log(res.data);
     var j=res.data.length;
     var len=res.data.length;
     var orderList=[];
     for(var i=0; i<len; i++){
        //var time_end_f=app.globalData.moment(res.data[i].time_end).format('YYYY-MM-DD');
        //var time_start_f=app.globalData.moment(res.data[i].time_start).format('YYYY-MM-DD');
        res.data[i].time_end=app.globalData.moment(res.data[i].time_end).format('MMMDo');
        res.data[i].time_start=app.globalData.moment(res.data[i].time_start).format('MMMDo');
        //res.data[i].order_price=Math.round(res.data[i].order_price*100/100);
        if(res.data[i].health_room.room_pay_way==1){
             res.data[i].order_price=(res.data[i].order_price*100/100).toFixed(2);
             res.data[i].Depositprice=(res.data[i].order_price*res.data[i].health_base.deposit_ratio).toFixed(2);
             res.data[i].Balanceprice=(res.data[i].order_price*(1-res.data[i].health_base.deposit_ratio)).toFixed(2);
        }else if(res.data[i].health_room.room_pay_way==0){
          res.data[i].order_price=(res.data[i].order_price*100/100).toFixed(2);
        }
       orderList[i]=res.data[j-1];
       j--;
        //console.log(orderList[i]);
        //console.log(orderList[i].Depositprice , orderList[i].Balanceprice);
     } 
        
     this.setData({
         isEnd: res.data.length < 10,
         orderList:orderList,
         loading: false
      })
     
    },error=>{

     })



  
    // var time_end=app.globalData.moment(this.data.orderList[0].time_end).format('YYYY-MM-DD');
    // var time_start=app.globalData.moment(this.data.orderList[0].time_start).format('YYYY-MM-DD');
   
    
    

  },



   tabFun:function(e){  
    //获取触发事件组件的dataset属性
     // var tab=e.currentTarget.dataset.tab
     // console.log(tab)
     //status=e.currentTarget.dataset.status;
     //console.log(status);
     var that=this;
     this.setData({
      loading:true
     })
     app.services('/api/v5/orders/order_list',{
          data:{
            order_status:e.currentTarget.dataset.status
          }
         }).then(res=>{
         
         var j=res.data.length;
         var len=res.data.length;
         var orderList=[];
         for(var i=0; i<len; i++){
            //var time_end_f=app.globalData.moment(res.data[i].time_end).format('YYYY-MM-DD');
            //var time_start_f=app.globalData.moment(res.data[i].time_start).format('YYYY-MM-DD');
            res.data[i].time_end=app.globalData.moment(res.data[i].time_end).format('MMMDo');
            res.data[i].time_start=app.globalData.moment(res.data[i].time_start).format('MMMDo');
            if(res.data[i].health_room.room_pay_way==1){
             res.data[i].order_price=(res.data[i].order_price*100/100).toFixed(2);
             res.data[i].Depositprice=(res.data[i].order_price*res.data[i].health_base.deposit_ratio).toFixed(2);
             res.data[i].Balanceprice=(res.data[i].order_price*(1-res.data[i].health_base.deposit_ratio)).toFixed(2);
           }else if(res.data[i].health_room.room_pay_way==0){
              res.data[i].order_price=(res.data[i].order_price*100/100).toFixed(2);
           }
            orderList[i]=res.data[j-1];
            j--;
            
            // console.log(orderList[i])
         } 
        
         this.setData({
             isEnd: res.data.length < 10,
             orderList:orderList,
             loading:false
          })
         
        },error=>{

     }); 
     this.setData({
      activeIndex: e.currentTarget.id
    })
  },  

  payment(e){
    var that=this;
    var orderstatus=e.currentTarget.dataset.orderstatus;
    var payway=e.currentTarget.dataset.payway;
    var is_action=this.data.is_action
    if(is_action) {
      return false
    }
    is_action=true;
    this.setData({
      is_action:is_action
    })
    if(orderstatus=='wait_confirmation' || orderstatus=='wait_pay'){
      wx.navigateTo({
      url:`/page/payment/payment?order_id=${e.currentTarget.dataset.id}&pay_way=${payway}`,
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
    }else if(orderstatus=='cancel' || orderstatus=='order_cancel'){
      wx.navigateTo({
      url:`/page/payCancel/payCancel?order_id=${e.currentTarget.dataset.id}&pay_way=${payway}`,
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
    }else if(orderstatus=='paid'){
      wx.navigateTo({
        url:`/page/paydetail/paydetail?order_id=${e.currentTarget.dataset.id}&pay_way=${payway}`,
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
    }
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     // this.onLoad();
     // this.setData({
     //   activeIndex:0
     // })
  }
	

}, toastScript))