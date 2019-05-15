const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },
  onLoad:function(params){
    var me = this;
    var redirectUrl=params.redirectUrl;
    //debugger
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");
      me.redirectUrl = redirectUrl;
    }
  },

  doLogin:function(e){
    var me =this;
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
      //调用后端
      wx.request({
        url: serverUrl+'/login',
        method:"post",
        data:{
          username:username,
          password:password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success:function(res){
          console.log(res.data);
          wx.hideLoading();
          var status = res.data.status;
          console.log(status);
          if(status==200){
            wx.showToast(
              {
                title: '登录成功！',
                icon: 'success',
                duration: 2000
              }
            ),
            //app.userInfo=res.data.data;
            app.setGlobalUserInfo(res.data.data);


            var redirectUrl = me.redirectUrl ;
            var user = app.getGlobalUserInfo();
            //debugger
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl!=""){
              //跳转
              wx.redirectTo({
                url: redirectUrl,
              })
            }else{
              //跳转
              wx.redirectTo({
                url: '../mine/mine?publisherId=' + user.id,
              })
            }
            
          }else if(status==500){
            wx.showToast(
              {
                title: res.data.msg,
                icon: 'none',
                duration: 3000,
                success:function(){
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              }
            )
          }
        }
      })
    }
  },

  goRegistPage:function(e){
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})