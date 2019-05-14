const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  doRegist:function(e){
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    //verify
    if(username.length==0||password.length==0){
      wx.showToast(
        {
          title:'用户/密码不能为空',
          icon:'none',
          duration:3000
        }
      )
    }else{
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '请等待...',
      })
      wx.request({
        url: serverUrl+'/regist',
        method:"post",
        data:{
          username:username,
          password:password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success:function(res){
          wx.hideLoading();
          console.log(res.data);
          var status = res.data.status;
          if(status==200){
            wx.showToast(
              {
                title: '用户注册成功！',
                icon: 'none',
                duration: 3000
              }
            ),
            //app.userInfo=res.data.data;
            app.setGlobalUserInfo(res.data.data);
          }else if(status==500){
            wx.showToast(
              {
                title: res.data.msg,
                icon: 'none',
                duration: 3000
              }
            )
          }
        }
      })
    }
  },

  goLoginPage:function(e){
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }
})