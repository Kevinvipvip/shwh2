const qiniuUploader = require("../../utils/qiniuUploader");

const app = getApp();

Page({
  didPressChooesImage: function() {
    wx.chooseImage({
      count: 1,
      success: function (res) {
        var filePath = res.tempFilePaths[0];
        upload({
          filePath: filePath,
          options: {
            key: '',          // 可选
            region: '',       // 可选(默认为'ECN')
            domain: '',
            uptoken: '',      // 以下三选一
            uptokenURL: '',
            uptokenFunc: () => {
              return '[yourTokenString]';
            },
            shouldUseQiniuFileName: true // 默认false
          },
          before: () => {
            // 上传前
            console.log('before upload');
          },
          success: (res) => {
            that.setData({
              'imageURL': res.imageURL,
            });
            console.log('file url is: ' + res.fileUrl);
          },
          fail: (err) => {
            console.log('error:' + err);
          },
          progress: (res) => {
            console.log('上传进度', res.progress)
            console.log('已经上传的数据长度', res.totalBytesSent)
            console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
          },
          complete: (err) => {
            // 上传结束
            console.log('upload complete');
          }
        });
      }
    });
  }
});