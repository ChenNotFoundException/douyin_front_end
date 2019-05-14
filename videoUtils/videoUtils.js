
function uploadVideo() {
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
}


module.exports={
  uploadVideo:uploadVideo
}