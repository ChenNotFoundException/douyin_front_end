var videoUtil = require('../../videoUtils/videoUtils.js')
const app = getApp()

Page({
  data: {
    cover:"cover",
    videoId:"",
    src:"",
    videoInfo:{},
    userLikeVideo:false,
    publiser:{},
    faceImage:"",
    creater:"",
    placeholder:"说点什么吧",
    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],
    prefix:""
  },

  videoXCtx:{},
  
  onLoad:function(params){
    var me = this;
    me.videoXCtx = wx.createVideoContext("myVideo", me);

    //获取上一个页面传入的参数
    var videoInfo = JSON.parse(params.videoInfo);
    //debugger
    var height = videoInfo.videoHeight;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width > height) {
      cover = "";
    }
    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl+videoInfo.videoPath,
      videoInfo: videoInfo,
      cover:cover,
      prefix: app.serverUrl
    });
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    var loginUserId="";
    if (user != null && user != undefined && user != '') {
      loginUserId=user.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?LoginUserId=' + loginUserId + "&VideoId=" + videoInfo.id +"&PublisherUserId="+videoInfo.userId,
      method:"post",
      success:function(res){
        console.log(res.data);
        var publiser = res.data.data.publiser;
        var userLikeVideo = res.data.data.userLikeVideo;
 
        //console.log(serverUrl);
        //console.log(publiser.faceImage);
        var faceImage = serverUrl + publiser.faceImage;
        var creater = publiser.nickname;
        //debugger
        me.setData({
          publiser:publiser,
          userLikeVideo: userLikeVideo, 
          faceImage: faceImage,
          creater: creater
        });
      },
      
    })

    me.getCommentsList(1);
  },
  
  onShow: function () {
    var me = this;
    me.videoXCtx.play();

  },
  onHide: function () {
    var me = this;
    me.videoXCtx.pause();

  },
  
  
  
  
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    
    })
  },

  upload:function(){
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }

  },

  showIndex:function(){
    wx.redirectTo({
      url: '../index/index',
    })
  },

  showMine:function(){
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = (me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    //debugger
    if(user==null ||user ==undefined||user==''){
      wx.redirectTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,

      })
      // wx.navigateTo({
      //   url: '../userLogin/login?redirectUrl=' + realUrl,
      // })
    }else{
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + user.id,
      })
    }
  },

  likeVideoOrNot:function(){
    var me = this;
    var videoInfo =me.data.videoInfo;
    var user = app.getGlobalUserInfo();
    var videoInfo = (me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == '') {
      wx.redirectTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,

      })
      // wx.navigateTo({
      //   url: '../userLogin/login?redirectUrl=' + realUrl,
      // })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      var url = '/video/userLike?userId='+user.id+'&videoId='+videoInfo.id +'&videoCreaterId='+videoInfo.userId;
      
      if (userLikeVideo){
        var url = '/video/userUnLike?userId=' + user.id + '&videoId=' + videoInfo.id + '&videoCreaterId=' + videoInfo.userId;
      }
    
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '...',
    })
      wx.request({
        url: serverUrl+url,
        method:"post",
        header: {
          'content-type': 'application/json', // 默认值
          'userId': user.id,
          'userToken': user.userToken,
        },
        success:function(res){
          wx.hideLoading();
          me.setData({
            userLikeVideo:!userLikeVideo
          });

        }
      })
    }



  },

  showPublisher:function(){
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@'+ videoInfo.userId;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId='+videoInfo.userId,
      })
    }
  },

  shareMe: function () {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '暂未开放...',
            icon:"none"
          })
        }
      }
    })
  },

  onShareAppMessage: function (res) {

    var me = this;
    var videoInfo = me.data.videoInfo;

    return {
      title: '短视频内容分析',
      path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
    }
  },
  
  leaveComment:function(){
    this.setData({
      commentFocus: true
    });
  },

  saveComment: function (e) {
    var me = this;
    var content = e.detail.value;
    // 获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;

    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        // url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + "&toUserId=" + toUserId,
        url: app.serverUrl + '/video/saveComment',
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function (res) {
          console.log(res.data)
          wx.hideLoading();

          me.setData({
            contentValue: "",
            commentsList: []
          });

          me.getCommentsList(1);
        }
      })
    }
  },

  getCommentsList: function (page) {
    var me = this;

    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + "&page=" + page + "&pageSize=5",
      method: "POST",
      success: function (res) {
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  onReachBottom: function () {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  }
})