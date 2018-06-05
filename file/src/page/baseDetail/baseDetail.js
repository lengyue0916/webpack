// page/baseDetail/baseDetail.js

var app = getApp();
var toastScript = require("../../templates/toast/toast");
var WxParse = require('../../templates/wxParse/wxParse.js');
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
   // startDate: '2017-01-01',
    //endDate:'2017-02-01',

    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    swiperCurrent: 0,
    swiperIndex:0,

    selectMonth:true,
    selectDay:false,

    count:1,

    days:1,

    isHidden:0,
    openConfirm: false,
    loading: true,
    is_share: false,
    shareSheet: false,

    modal_visiable: false,
    is_action:false

    // is_share: false,
    // shareSheet:false
   　//status:0
    //collected:0
 },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       //console.log(options.scene);
       var that = this;
       if (options.scene) {
            let scene = decodeURIComponent(options.scene);
            scene = scene.split(',');
            options = {};
            options.id = scene[0];
            options.share_id = scene[1];
            options.share_path = scene[2];
            app.server.getStatus().then(res => {
                app.services('/api/v4/shares/click_share_topic', {
                    data: {
                        share_topic_id: Number(options.share_id)
                    }
                }).then(rect => {

                })
            })
        }
        //console.log(options);
        
        this.context = wx.createCanvasContext('myCanvas');
     
     if(wx.getStorageSync('ROOM_SOURCE_DATE')){
         wx.removeStorageSync('ROOM_SOURCE_DATE');
     }
     
     if(wx.getStorageSync('ROOM_SOURCE_DATEM')){
         wx.removeStorageSync('ROOM_SOURCE_DATEM');
     }
     

        //var baseList = wx.getStorageSync('item_id');
       //console.log(baseList)
    //
    var num=parseInt(this.data.count)

    var startFMDate = app.globalData.moment().add(8,'days').format('YYYY-MM-DD')
    var startFDate = app.globalData.moment().add(8,'days').format('YYYY-MM-DD')
    var endFMDate= app.globalData.moment(startFMDate).add(30*num,'days').format('YYYY-MM-DD')
    var endFDate= app.globalData.moment(startFMDate).add(1,'days').format('YYYY-MM-DD')  
    var startTime=app.globalData.moment(startFMDate).format('YYYY-MM-DD')
    var endTime=app.globalData.moment(endDate).format('YYYY-MM-DD')

    var startMDate=app.globalData.moment(startFMDate).format('MMMDo')
    var startDate=app.globalData.moment(startFDate).format('MMMDo')
    var endMDate=app.globalData.moment(endFMDate).format('MMMDo')
    var endDate=app.globalData.moment(endFDate).format('MMMDo')

    
    var weekDayMS=app.globalData.moment(startFMDate).format('dddd')
    var weekDayS=app.globalData.moment(startFDate).format('dddd')
    var weekDayME=app.globalData.moment(endFMDate).format('dddd')
    var weekDayE=app.globalData.moment(endFDate).format('dddd')
    
    var days=app.globalData.moment.duration(app.globalData.moment(endFDate)-app.globalData.moment(startFDate)).as('day');

    
    // debugger

    app.getDiff()

    app.services('/api/v5/health_bases/get_base_detarlis',{data:{health_base_id:options.id}}).then(res=>{
      console.log(res.data);

      var desc=res.data.bases.desc.replace(/\s+|[&nbsp;]|<[^>]+>/g,'').substring(0, 18)+ '...';
      console.log(desc);

      var details=res.data.bases.details;
      WxParse.wxParse('details', 'html', details, this, 5);
      WxParse.wxParse('desc', 'html', desc, this, 5);


      wx.setNavigationBarTitle({
  　　　   　title: '就喜欢-'+res.data.bases.name
　　　　  })    
     this.setData({
          baseDetails:res.data,
          is_collections:res.data.is_collections,
          isEnd: res.data.rooms.length < 10,
          shareData: {
                    path: "page/baseDetail/baseDetail",
                    title:res.data.bases.name,
                    cover_img:res.data.bases.cover_img,
                    base_id: options.id
                },
          loading:false
      })
    },error=>{

    })
   
   this.setData({
       base_id:options.id,
       startFMDate:startFMDate,
       endFMDate:endFMDate,
       startFDate:startFDate,
       endFDate:endFDate,
       startMDate:startMDate,
       endMDate:endMDate,
       startDate:startDate,
       endDate:endDate,
       
       // startTime:startTime,
       // endTime:endTime,
       weekDayMS:weekDayMS,
       weekDayME:weekDayME,
       weekDayS:weekDayS,
       weekDayE:weekDayE,
       days:days
       
       
       


       //is_collect: res.data.is_collect,
    })
    // app.services('/orderDetails',{date:{}}).then(res=>{
    //       this.setDate({
    //         // roomlist:res.date,
    //         // console.log(roomlist)
    //       })
    // },error=>{

    // })
    

  },

  shareError(e) {
        this.toast(e.detail.msg)
    },

/**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
     // var that = this;
     // if (that.options.id) {
              
     //    wx.navigateTo({
     //        url: '/page/IntrDetails/IntrDetails?id='+that.options.id,
     //    })
     //    delete that.options.id
     //  }
       
  },
//swiper
   changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  },

  swiperChange: function(e){  
    let swiperCurrent = e.detail.current; 
    this.setData({  
      //swiperCurrent: e.detail.current 
      swiperIndex:swiperCurrent 
    })  
  },  


  detailImg(e){
    var current=e.target.dataset.src;
    var imgsrc=[];
    for(var i=0; i<this.data.baseDetails.imgs.length; i++){
      imgsrc.push(this.data.baseDetails.imgs[i].img);
    }  
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: imgsrc // 需要预览的图片http链接列表
     
    })
  },
//选择日时选择开始时间
//   startDateChange: function(e) {
//     console.log('picker发送选择改变，携带值为', e.detail.value)
//     var endDate=app.globalData.moment(e.detail.value).add(7,'days').format('YYYY-MM-DD')
//     var entime=app.globalData.moment(endDate).format('YYYY-MM-DD')
//     var endDateN=this.data.endDate
//     //console.log(this.data.endDate)
//     var startDate=app.globalData.moment(e.detail.value).format('YYYY-MM-DD');
//     var daycount=app.globalData.moment.duration(app.globalData.moment(endDateN)-app.globalData.moment(endDate)).as('day')
//     console.log(daycount)
//     daycount=parseInt(daycount)
//     if(daycount>0){
//        endDate=endDateN;
//     }else{
//        endDate=endDate;
//     }

//    var days=app.globalData.moment.duration(app.globalData.moment(endDate)-app.globalData.moment(e.detail.value)).as('day');

//    this.setData({
//       startDate: startDate,
//       endDate: endDate,
//       endTime: entime,
//       days:days

//     })
//   },
// //选择日时选择结束时间
//    endDateChange: function(e) {
//     console.log('picker发送选择改变，携带值为', e.detail.value);
//     var endDate=app.globalData.moment(e.detail.value).format('YYYY-MM-DD');
//     var days=app.globalData.moment.duration(app.globalData.moment(e.detail.value)-app.globalData.moment(this.data.startDate)).as('day');
//     this.setData({
//       endDate:endDate,
//       days:days
//     })
//   },
// //选择月时选择开始时间
//   startDateMChange: function(e) {
//     console.log('picker发送选择改变，携带值为', e.detail.value)
//     var num=parseInt(this.data.count)
//     var startMDate=app.globalData.moment(e.detail.value).format('YYYY-MM-DD');
//     var endMDate= app.globalData.moment(e.detail.value).add(30*num,'days').format('YYYY-MM-DD')
//     this.setData({
//       startMDate: startMDate,
//       endMDate:endMDate
//     })
//   },

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

  onShareApp:function(){  
    this.onShareAppMessage()  
  }, 

  

   introDetails(e){
    var bases=e.currentTarget.dataset.bases
    wx.setStorageSync('bases', bases);
    wx.navigateTo({
      url:`/page/IntrDetails/IntrDetails?id=`+this.data.base_id
    })
  },

  selectMonth(){
     this.setData({
            selectMonth:true,
            selectDay:false
        })
   },

   selectDay(){
    this.setData({
            selectMonth:false,
            selectDay:true
        })
   },
//加
   addMD(e){
    var that=this;
    var count=that.data.count;
    count++;
    var num=parseInt(count);
    //console.log(num);
    //console.log(e.currentTarget.dataset.times);
    var startDates=e.currentTarget.dataset.times;
    var endFMDate= app.globalData.moment(startDates).add(30*num,'days').format('YYYY-MM-DD');
    var endMDate= app.globalData.moment(startDates).add(30*num,'days').format('MMMDo');
    var weekDayME= app.globalData.moment(startDates).add(30*num,'days').format('dddd');
    //console.log(endMDate);
    that.setData({
        count:count,
        endMDate:endMDate,
        endFMDate:endFMDate,
        weekDayME:weekDayME
    })

   },
//减
   minusMd(e){
    var that=this;
    var count=that.data.count;
    if(count == 1){
        that.toast('月数不能小于１');
        return false;
    }else{
      count--;
      var num=parseInt(count);
      var startDates=e.currentTarget.dataset.times;
      var endFMDate= app.globalData.moment(startDates).add(30*num,'days').format('YYYY-MM-DD');
      var endMDate= app.globalData.moment(startDates).add(30*num,'days').format('MMMDo');
      var weekDayME= app.globalData.moment(startDates).add(30*num,'days').format('dddd');
    }

    that.setData({
          count:count,
          endMDate:endMDate,
          endFMDate:endFMDate,
          weekDayME:weekDayME
      })
  },
　//弹框
  showmodal(e){
     var model=e.currentTarget.dataset.room;
     //model.introduce=WxParse.wxParse('introduce', 'html', model.introduce, that, 5);
     var introduce=model.introduce;

     WxParse.wxParse('introduce', 'html', introduce, this, 5);
     //console.log(introduce);
     var mouthDeposit=(model.month_fee*this.data.count*this.data.baseDetails.bases.deposit_ratio).toFixed(2);
     var dayDeposit=(model.price*this.data.days*this.data.baseDetails.bases.deposit_ratio).toFixed(2);
     var mouthBalance=(model.month_fee*this.data.count*(1-this.data.baseDetails.bases.deposit_ratio)).toFixed(2);
     var dayBalance=(model.price*this.data.days*(1-this.data.baseDetails.bases.deposit_ratio)).toFixed(2);

     //console.log((model.month_fee*this.data.count*this.data.baseList.deposit_ratio).toFixed(2));

     this.setData({
       modal_visiable: true,
       model:model,
       //Mintroduce:introduce,
       mouthDeposit:mouthDeposit,
       dayDeposit:dayDeposit,
       mouthBalance:mouthBalance,
       dayBalance:dayBalance
    })
  },

  cancle(){
    this.setData({
       modal_visiable: false,
    })
  },

  //页面跳转 
  hotelOrder(e){
    var that=this;
    
    var room=e.currentTarget.dataset.room
    var is_action=this.data.is_action;
    console.log(is_action);
    if(is_action) {
       return false
    }
    is_action=true;
    this.setData({
       is_action:is_action
    })
    //console.log(base)
    //console.log(e.currentTarget.dataset.id)
    wx.setStorageSync('room_id', room)
    wx.setStorageSync('monthsnum', this.data.count)
    wx.setStorageSync('daysnum', this.data.days)
    wx.setStorageSync('itemname', this.data.baseDetails.bases.name)
    wx.setStorageSync('month', this.data.selectMonth)
    wx.setStorageSync('day', this.data.selectDay)
    wx.setStorageSync('startmdate', this.data.startMDate)
    wx.setStorageSync('endmdate', this.data.endMDate)
    wx.setStorageSync('startdate', this.data.startDate)
    wx.setStorageSync('enddate', this.data.endDate)
    wx.setStorageSync('startFmdate', this.data.startFMDate)
    wx.setStorageSync('endFmdate', this.data.endFMDate)
    wx.setStorageSync('startFdate', this.data.startFDate)
    wx.setStorageSync('endFdate', this.data.endFDate)
    wx.setStorageSync('deposit_ratio', this.data.baseDetails.bases.deposit_ratio)
    wx.setStorageSync('base_time', this.data.baseDetails.bases.base_time_yes)

    // console.log(this.data.count)
    // console.log(this.data.days)
    // console.log(this.data.count)
    // console.log(this.data.baseList.name)
    
    wx.navigateTo({
      url:`/page/hotelOrder/hotelOrder?id=${e.currentTarget.dataset.id}`,
      success(){
          
      },
      fail(){
         
      },
      complete(){
        setTimeout(function(){
          is_action=false;
          that.setData({
             is_action:is_action
          })
        },1500)
          
      }
      
    })
    
    this.setData({
       modal_visiable:false,
    })
  },
//选择日跳转
selectData(e){
  　 var checkInDate=e.currentTarget.dataset.indata
    var checkOutDate=e.currentTarget.dataset.outdata
   
   wx.navigateTo({
      url:`/page/selectData/selectData?checkInDate=${checkInDate}&&checkOutDate=${checkOutDate}`
     })
  },
//选择月跳转
  selectDataM(e){
  　 var checkInDate=e.currentTarget.dataset.inmdata
    var checkOutDate=e.currentTarget.dataset.outmdata
    wx.navigateTo({
      url:`/page/selectDatam/selectDatam?checkInDatem=${checkInDate}&&checkOutDatem=${checkOutDate}`
     })
  },
//收藏
collectionClick() { // 收藏
    var collection_status = this.data.is_collections;
    var that = this;
    if (collection_status == 0) {
        // 收藏
       app.services('/api/v5/health_bases/collect_base', {
            data: {
                health_base_id: that.data.base_id
            },
        method: 'POST'    
        }).then(res => {
            that.toast('收藏成功')
            console.log(res)
             that.setData({
               is_collections: 1
           })

        }, error => {
            that.setData({
                is_collections: 0
                
            })
            that.toast('收藏失败')
        })
    } else if(collection_status == 1){
        // 取消收藏
        
        app.services('/api/v5/health_bases/cancel_collect', {
            data: {
                health_base_id: that.data.base_id
            }
        }).then(res => {

            that.toast('取消成功')
            console.log(res)
            that.setData({
              is_collections: 0
           })

        }, error => {
            console.log(res)
            that.setData({
                is_collections: 1
                //statusCode:res.statusCode
            })
            that.toast('取消失败')
        })
    }
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      var selectDate = wx.getStorageSync('ROOM_SOURCE_DATE');
      var selectDateM=wx.getStorageSync('ROOM_SOURCE_DATEM');
       console.log(selectDate)
       //console.log(selectDateM)
      
      

    // var startFMDate = app.globalData.moment().add(1,'days').format('YYYY-MM-DD')
    // var endFMDate= app.globalData.moment(startFMDate).add(30*num,'days').format('YYYY-MM-DD')
    // var endFDate= app.globalData.moment(startFMDate).add(1,'days').format('YYYY-MM-DD')  
    // var startTime=app.globalData.moment(startFMDate).format('YYYY-MM-DD')
    // var endTime=app.globalData.moment(endDate).format('YYYY-MM-DD')

    var startFDate = app.globalData.moment().add(8,'days').format('YYYY-MM-DD');
    var endFDate= app.globalData.moment(startFDate).add(1,'days').format('YYYY-MM-DD');

    var startFMDate = app.globalData.moment().add(8,'days').format('YYYY-MM-DD');
    var endFMDate= app.globalData.moment(startFMDate).add(30,'days').format('YYYY-MM-DD');

    if(selectDate){
       var checkInDate=selectDate.checkInDate;
       var checkOutDate=selectDate.checkOutDate;
       if(checkInDate&&checkOutDate){
           startFDate=checkInDate;
           endFDate=checkOutDate;
       }else{
         startFDate=startFDate;
         endFDate=endFDate
       }
    }
   
  
   if(selectDateM){
         var checkInDatem=selectDateM.checkInDatem;
         var checkOutDatem=selectDateM.checkOutDatem;
         if(checkInDatem&&checkInDatem){
              startFMDate=checkInDatem;
              endFMDate=checkOutDatem;
         }else{
              startFMDate=startFMDate;
              endFMDate=endFMDate;
         }
    }

    
    console.log(startFDate,endFDate);

    var startDate=app.globalData.moment(startFDate).format('MMMDo');
    var endDate=app.globalData.moment(endFDate).format('MMMDo');

    var startMDate=app.globalData.moment(startFMDate).format('MMMDo');
    var endMDate=app.globalData.moment(endFMDate).format('MMMDo');

    var weekDayS=app.globalData.moment(startFDate).format('dddd');
    var weekDayE=app.globalData.moment(endFDate).format('dddd');

    var weekDayMS=app.globalData.moment(startFMDate).format('dddd');
    var weekDayME=app.globalData.moment(endFMDate).format('dddd');
    
    var days=app.globalData.moment.duration(app.globalData.moment(endFDate)-app.globalData.moment(startFDate)).as('day');

       this.setData({
      
       startFDate:startFDate,
       endFDate:endFDate,
       startFMDate:startFMDate,
       endFMDate:endFMDate,
       
       endDate:endDate,
       startDate:startDate,
       startMDate:startMDate,
       endMDate:endMDate,

       weekDayS:weekDayS,
       weekDayE:weekDayE,
       weekDayMS:weekDayMS,
       weekDayME:weekDayME,

       count:1,
       days:days
    })
    
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

  // wx.setNavigationBarTitle({
  //   title: '当前页面'
  // }),

  /**
   * 用户点击右上角分享
   */
   onShareAppMessage: function () {  
   var that = this;
   var scene = this.data.base_id + ',' + this.share_id + ',' + '/page/baseDetail/baseDetail';
   console.log(scene);
        return {
           // title: this.data.article.title,
            title:'就喜欢-'+this.data.baseDetails.bases.name,
            imageUrl: this.data.baseDetails.bases.cover_img + '!shareCard',
            path:  '/page/baseDetail/baseDetail?scene=' + scene,
            success: function(res) {
                console.log(res)
                wx.showToast({
                    title: "分享成功",
                    duration: 2000

                });
                that.setData({
                    openShare: false
                })
            },
            fail: function(res) {
                that.toast('分享失败');
            }
        }
  },

  shareHandle() {
    var that = this;
        app.services('/api/v4/shares/add_share', {
            data: {
                wechat_topic_id: that.data.base_id
            }
        }).then(rect => {
            that.share_id = rect.data.id
            that.setData({
                openShare: true
            })
        }, error => {
            that.share_id = undefined;
            that.toast('分享失败')
        })
    }  
}, toastScript, WxParse))