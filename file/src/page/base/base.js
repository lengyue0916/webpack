// page/base/base.js
var app = getApp();
var toastScript = require("../../templates/toast/toast");
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    baseList: [],
    page: 1,
    //size: 3,
    isHideLoadMore:false,
    isEnd: false,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // if(wx.getStorageSync('item_id')){
      //    wx.removeStorageSync('item_id');
      //  }
      // app.server.getStatus().then(res => {
      //       this.getData()
      //   }, error => {
      //       this.toast(error.login_status)
      //   })
      wx.setNavigationBarTitle({
  　　　　title: '就喜欢-发现'
　　　　})
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
        // app.server.getStatus().then(res => {
        //     let userInfo = wx.getStorageSync('userInfo');
        //     if (userInfo.user_hobby_id == null) {
        //         wx.redirectTo({
        //             url: '/page/bootPage/bootPage'
        //         })
        //     }
        // })
         // var that = this;
         // if (that.options.scene) {
         //        let scene = decodeURIComponent(that.options.scene);
         //        scene = scene.split(',');
               
         //        wx.navigateTo({
         //            url: scene[2]+'?scene=' + that.options.scene,
         //        })
         //        delete that.options.scene
         //  }
       
    },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onPullDownRefresh();
  },
  // getData(){
  //    app.services('/api/v5/health_bases/get_base_list').then(res=>{
  //     console.log(res.data)
  //     this.setData({
  //       isEnd: res.data.length < 10,
  //       baseList:res.data,
  //       loading: false
  //     })
  //     //console.log(res.data)
  //   },error=>{
  //   })
    
  // },

 
  baseDetail(e){

    wx.navigateTo({
      url:`/page/baseDetail/baseDetail?id=${e.currentTarget.dataset.id}`
      //url:`/page/index/index?scene=6064,0,7,2104,/page/inDetail/inDetail`
     
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
    this.page = 1;
        // 下拉刷新
        app.services('/api/v5/health_bases/get_base_list', { 
            data: {
                page: this.page
            }
        }).then(res => {
            var baseList = res.data;
            this.setData({
                isEnd: res.data.length < 10,
                baseList: baseList,
                loading: false
            })
            wx.stopPullDownRefresh()
        }, error => {
            wx.stopPullDownRefresh()
        })
        this.page++;
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 上拉加载
       
        if (!this.data.isEnd) {
            this.setData({
              isHideLoadMore:true
            })
            app.services('/api/v5/health_bases/get_base_list', {
                data: {
                    page: this.page
                }
            }).then(res => {
                var baseList = res.data;
                this.setData({
                   isEnd: res.data.length < 10,
                   baseList: baseList,
                   loading: false,
                   isHideLoadMore:false
                })
            }, error => {
                this.setData({
                    isEnd:true,
                    baseList:[],
                    loading: false,
                    isHideLoadMore:false
                })
            })
            this.page++;
        }
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
     var that = this;
        return {
            title: '就喜欢',
            path: '/page/base/base',
            success: function(res) {
                that.toast('分享成功')

            },
            fail: function(res) {
                // 转发失败
                that.toast('分享失败')

            }
        }
  }
}, toastScript))