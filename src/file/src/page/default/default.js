var app = getApp();
Page({
    data: {
       
    },
    onLoad: function() {
       
    },
    //获取用户信息新接口
  userInfoHandler(e) {
    //设置用户信息本地存储
   
      //wx.setStorageSync('userInfo', e.detail.userInfo);
      console.log(e.detail.errMsg)
     
      app.server.getUserInfo();
      this.getAccredit();
      
  },


   getAccredit() {
       // const self = this;
        wx.getSetting({
            success(res) {
            　　//已授权
              if(res.authSetting['scope.userInfo']){
              	wx.switchTab({
             　　　　 url:`/page/index/index`
          　　　   })

             
            }
            // else{//未授权
            //   wx.showModal({
            //        title: '请点击允许，才能开启发现之旅',
            //     　　　icon: 'warn',
            //     　　　duration: 1500,
            //     })
            // }
          }
        })
    }
 
})
  