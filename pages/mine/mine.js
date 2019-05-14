const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe:true,
    isFollow:false,
    publisherId:"",
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true

  },

  onLoad: function(params) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;

    var publisherId = params.publisherId;
    me.setData({
      publisherId: publisherId
    })
    //debugger
    if(publisherId!=userId){
      me.setData({
        isMe:false,
      })
    }
    if (publisherId != null && publisherId != '' && publisherId != undefined) {
      
      userId = publisherId;
      
    };


    wx.showLoading({
      title: '加载中',
    })
    var serverUrl = app.serverUrl;
    //调用后端
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId+'&fanId='+user.id,
      method: "post",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken,
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        var status = res.data.status;
        if (status == 200) {
          var userInfo = res.data.data;
          console.log(userInfo);
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            faceUrl = serverUrl + userInfo.faceImage;
          }
          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow
          })
        } else if (status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }
    })
  },

  logout: function() {
    var user = app.getGlobalUserInfo();
    //调用后端
    wx.request({
      url: app.serverUrl + '/logout?userId=' + user.id,
      method: "post",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log(res.data);
        wx.hideLoading();
        var status = res.data.status;
        if (status == 200) {
          wx.showToast({
              title: '注销成功！',
              icon: 'success',
              duration: 2000
            }),
            //app.userInfo = null;
            //清空緩存
            wx.removeStorageSync("userInfo");
          //TODO 跳转
          wx.navigateTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  changeFace: function() {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        var serverUrl = app.serverUrl;
        var userInfo = app.getGlobalUserInfo();
        wx.showLoading({
          title: '上传中...',
        })
        wx.uploadFile({
          url: serverUrl + "/user/uploadFace?userId=" + userInfo.id,
          filePath: tempFilePaths[0],
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
                icon: "success"
              });
              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              });
            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg,
              })
            }
          }
        })



      }
    })
  },

  uploadVideo: function() {
    var me = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      camera: 'back',
      success(res) {
        console.log(res)
        var duration = res.duration;
        var height = res.height;
        var width = res.width;
        var tmpVideoUrl = res.tempFilePath;
        var temCoverUrl = res.thumbTempFilePath;

        if (duration > 16) {
          wx.showToast({
            title: '视频不能超过15秒',
            duration: 2500,
          })
        } else {
          // 选择BGM界面
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration +
              "&height=" + height +
              "&width=" + width +
              "&tmpVideoUrl=" + tmpVideoUrl +
              "&temCoverUrl=" + temCoverUrl,
          })
        }
      }
    })
  },

  followMe:function(e){
    var me = this;
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;
    var followType = e.currentTarget.dataset.followtype;
    // console.log(e.currentTarget.dataset);
    var url = '';
    //1-未关注 0-已关注
    if(followType=='1'){
      //关注
      url = '/user/beyourfans?userId=' + publisherId+'&fanId='+userId;
    }else{
      //取消关注
      url = '/user/dontbeyourfans?userId=' + publisherId + '&fanId=' + userId;
    }
    //debugger
    wx.showLoading();
    wx.request({
      url: app.serverUrl+url,
      method:"post",
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken,
      },
      success:function(){
        wx.hideLoading();
        if (followType=='1'){
          me.setData({
            isFollow:true,
          })
        }else{
          me.setData({
            isFollow:false,
          })

        }
      }
    })


  },

  doSelectWork: function () {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyVideoList(1);
  },

  doSelectLike: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyLikesList(1);
  },

  doSelectFollow: function () {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });

    this.getMyFollowList(1)
  },

  getMyVideoList: function (page) {
    var me = this;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page + '&pageSize=6',
      method: "POST",
      data: {
        userId: me.data.publisherId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyLikesList: function (page) {
    var me = this;
    var userId = me.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var me = this;
    var userId = me.data.publisherId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  // 点击跳转到视频详情页面
  showVideo: function (e) {

    console.log(e);

    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.navigateTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo
    })

  },


  // 到底部后触发加载
  onReachBottom: function () {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var currentPage = this.data.myVideoPage;
      var totalPage = this.data.myVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.myLikesTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    } else if (!myFollowFalg) {
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  }


})