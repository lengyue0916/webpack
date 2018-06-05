// page/IntrDetails/IntrDetails.js
var app = getApp();
var WxParse = require('../../templates/wxParse/wxParse.js');
const Tagicon = require('../../assets/lib/icons.js');

Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
   activeIndex: 0,
   tab:['基地介绍','设施服务','详情须知']
   

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var baseList = wx.getStorageSync('bases');
    var desc=baseList.desc;
    var details=baseList.details;
    var roomList=baseList.room_list;
    //console.log(roomList)
    var tag=Tagicon.tag.Arrayicon;
    var tagList=[];
    var typeList=[]

    //console.log(Tagicon.tag);
    for (var i=0; i<roomList.length; i++){
      
      for(var j=0; j<tag.length; j++){
         if(tag[j].name==roomList[i]){
              tagList.push(tag[j]);
              if(typeList.indexOf(tag[j].type) == -1)
              {
                typeList.push(tag[j].type)           
              }
          }
          
      }
    }
     
    

    WxParse.wxParse('desc', 'html', desc, this, 5);
    WxParse.wxParse('details', 'html', details, this, 5);
    

    wx.setNavigationBarTitle({
  　　　　title: '就喜欢-'+baseList.name
　　　　})

    // app.server.getStatus().then(res => {
    //         that.getData()
    //     }, error => {
    //         that.toast(error.login_status)
    //     })
    this.setData({
      baseList:baseList,
      tagList:tagList,
      typeList:typeList,
      base_id:options.id
      //desc:desc,
     // details:details
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

  // tab(obj){
  //   var dataId = e.currentTarget.id;
  //   var obj = {};
  //   obj.curHdIndex = dataId;
  //   obj.curBdIndex = dataId;
  //   this.setData({
  //     tabArr: obj
  //   })
  // },

  getData(){
     app.services('').then(res=>{
      this.setData({
        /***baseList:res.data,***/
        loading: false
      })
      console.log(res.data)
    },error=>{
    })
    
  },

   tabFun:function(e){  
    //获取触发事件组件的dataset属性
     var tab=e.currentTarget.dataset.tab
     //console.log(tab) 

//       wx.setNavigationBarTitle({
//   　　　　　　　title: '就喜欢-'+tab
// 　　　　　}) 
     
    this.setData({
      activeIndex: e.currentTarget.id
      
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
        return {
            title: '就喜欢-'+that.data.baseList.name,
            imageUrl: this.data.baseList.cover_img,
            path: '/page/IntrDetails/IntrDetails?id='+that.data.base_id,
            //path: '/page/baseDetail/baseDetail?id='+that.data.base_id,
            success: function(res) {
                that.toast('分享成功')
            },
            fail: function(res) {
                // 转发失败
                that.toast('分享失败')

            }
        }
  }
},WxParse))