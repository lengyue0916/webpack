// page/base/base.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    baseList: [],
    //page: 1,
    //size: 3,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // if(wx.getStorageSync('item_id')){
      //    wx.removeStorageSync('item_id');
      //  }
      //console.log(options);
      
      //console.log(type_id);
      
      app.server.getStatus().then(res => {
          app.services('/api/v5/health_bases/type_base_list',{
          data:{
            type_id:options.type_id
          }
       }).then(res=>{
          console.log(res.data);
         
          var className = wx.getStorageSync('className');
          wx.setNavigationBarTitle({
  　　　        　title: '就喜欢-'+className
　　　　       })
          
          this.setData({
            isEnd: res.data.length < 10,
            baseList:res.data,
            loading: false
          })
           
          //console.log(res.data)
         },error=>{
        })     
        }, error => {
            this.toast(error.login_status)
        })//
      //this.loadBase();
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
    //this.onPullDownRefresh();
    this.onLoad();
  },

 
  baseDetail(e){

    // var items=e.currentTarget.dataset.item

    //  wx.setStorageSync('item_id', items);
   
    wx.navigateTo({
      url:`/page/baseDetail/baseDetail?id=${e.currentTarget.dataset.id}`
     
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
    // this.page = 1;
    //     // 下拉刷新
    //     app.services('/api/v5/health_bases/get_base_list', { 
    //         data: {
    //             page: this.page
    //         }
    //     }).then(res => {
    //         var baseList = res.data;
    //         this.setData({
    //             isEnd: res.data.length < 10,
    //             baseList: baseList,
    //             loading: false
    //         })
    //         wx.stopPullDownRefresh()
    //     }, error => {
    //         wx.stopPullDownRefresh()
    //     })
    //     this.page++;
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 上拉加载
        // if (!this.data.baseList.isEnd) {
        //     app.services('/api/v5/health_bases/get_base_list', {
        //         data: {
        //             page: this.page
        //         }
        //     }).then(res => {
        //         var baseList = res.data;
        //         this.setData({
        //            isEnd: res.data.length < 10,
        //            baseList: baseList,
        //            loading: false
        //         })
        //     }, error => {
        //         this.setData({
        //             isEnd:ture,
        //             baseList:[],
        //             loading: false
        //         })
        //     })
        //     this.page++;
        // }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
}, toastScript))