const app = getApp()

Page({
  data: {
    screenWidth: 350,
    //分页属性
    totalPage:1,
    page:1,
    videoList:[],
    serverUrl:"",
    searchContent:""

  },

  onLoad: function (params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;
    if(isSaveRecord==null || isSaveRecord==''||isSaveRecord==undefined){
      isSaveRecord=0;
    }
    me.setData({
      searchContent: searchContent,
    })



    //当前分页数
    var page = me.data.page;
    me.getAllVideoList(page, isSaveRecord);


  },

  getAllVideoList: function (page, isSaveRecord){
    var me = this;
    var serverUrl = app.serverUrl;

    wx.showLoading({
    title: '加载中',
    });

    var searchContent = me.data.searchContent;
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page+'&isSaveRecord='+isSaveRecord,
      data:{
        videoDesc:searchContent
      },
      method: "post",
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

      //判断当前页是否为第一页,是则清空videoList
      if (page == 1) {
        me.setData({
          videoList: []
        })
      }

      var videoList = res.data.data.rows;
      var newVideoList = me.data.videoList;

      me.setData({
        videoList: newVideoList.concat(videoList),
        page: page,
        totalPage: res.data.data.total,
        serverUrl: serverUrl,
      });

    }
    })
  },

  onReachBottom:function(){
    var me = this;
    var currentPage = me.data.page;
    var totalPage= me.data.totalPage;
    if(currentPage==totalPage){
     
      wx.showToast({
        title: '已经是我的底线啦',
        icon: "none",
      });
      return;
    }
    var page=currentPage+1;

    me.getAllVideoList(page,0);

  },

  onPullDownRefresh:function(){
    wx.showNavigationBarLoading();
    var me =this;
    me.getAllVideoList(1,0);

  },

  showVideoInfo:function(e){
    var me = this;
    var videoList =me.data.videoList;
    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);
    wx.navigateTo({
      url: '../videoinfo/videoinfo?videoInfo='+videoInfo,
    })
  },

})
