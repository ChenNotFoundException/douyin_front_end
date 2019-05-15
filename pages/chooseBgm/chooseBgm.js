const app = getApp()

Page({
    data: {
      bgm:[],
      serverUrl:'',
      videoParms:{}
    },

    onLoad: function (params) {
      var me = this;
      console.log(params);
      me.setData({
        videoParms:params
      });
      var serverUrl = app.serverUrl;
      var serverUrl2 = app.serverUrl2;
      wx.request({
        url: serverUrl + '/bgm/list',
        method: "post",
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          // console.log(res.data);
          wx.hideLoading();
          if(res.data.status==200){
            var bgmList=res.data.data;
            me.setData({
              bgmList:bgmList,
              serverUrl:serverUrl,
            })
          }
        }
      })
    },

  upload:function(e){
    var me = this;

    var bgmId= e.detail.value.bgmId;
    var desc = e.detail.value.desc;
    var duration = me.data.videoParms.duration;
    var height = me.data.videoParms.height;
    var width = me.data.videoParms.width;
    var tmpVideoUrl = me.data.videoParms.tmpVideoUrl;
    var temCoverUrl = me.data.videoParms.temCoverUrl;
    //上传短视频

    wx.showLoading({
      title: '上传中...',
    })
    var serverUrl = app.serverUrl;
    var userInfo = app.getGlobalUserInfo();
    wx.uploadFile({
      url: serverUrl + "/video/upload",
      formData:{
        userId: userInfo.id,
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: height,
        videoWidth: width
      },
      filePath: tmpVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        const data = JSON.parse(res.data);
        console.log(data);
        wx.hideLoading();
        if (data.status == 200) {
          wx.showToast({
            title: '上传成功',
            icon: "success",
            duration:1000
          });
          wx.navigateBack({
            delta: 1,
          })

        }
      }
    })
  }

    
})

