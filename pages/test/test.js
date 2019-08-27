const qiniu = require('../../utils/qiniu.min');

const app = getApp();

Page({
  data: {
    qiniu_token: ''
  },
  onLoad() {
    // app.getUpToken(res => {
    //   this.data.qiniu_token = res.token;
    //   this.upload();
    // });
  },
  upload() {
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数
      success: res => {
        // 上传七牛云
        let tempFilePaths = res.tempFilePaths;

        qiniu.upload(tempFilePaths[0], 'abcdppp.jpg', 'ERmZoZXo1aO6iU7mLAeCTiPTxDnRxvC1QVNO9-I4:WhQ3vkynHxsuFWLIxdodsTElbxA=:eyJjYWxsYmFja1VybCI6Imh0dHBzOlwvXC9jYXZlcy53Y2lwLm5ldFwvcWluaXVfY2FsbGJhY2sucGhwIiwiY2FsbGJhY2tCb2R5Ijoie1wiZm5hbWVcIjpcInRtcFxcXC8xNTY2ODk0NDA5MTI0MTk2MDA0NTZcIixcImZrZXlcIjpcIjE1NjY4OTQ0MDkxMjQxOTYwMDQ1NlwiLFwiZGVzY1wiOlwiXFx1NjU4N1xcdTRlZjZcXHU2M2NmXFx1OGZmMFwifSIsInNjb3BlIjoiY2F2ZXMiLCJkZWFkbGluZSI6MTU2Njg5ODAwOX0=',null,{
          useCdnDomain: true,
          region: 'http://upload-z2.qiniup.com/'
        }
          );
      }
    });
  },
  /**
   * 图片上传七牛云
   */
  uploadQiniu(tempFilePaths) {
    let token = this.data.qiniu_token;

    console.log(tempFilePaths, token);

    var that = this;
    wx.uploadFile({
      url: 'https://qiniu.wcip.net',
      name: 'file',
      filePath: tempFilePaths[0],
      header: {
        "Content-Type": "multipart/form-data"
      },
      formData: {
        token: token,
      },
      success: function (res) {
        let data = JSON.parse(res.data)

        console.log('qiniu');
        console.log(res);
        // to do ...
      },
      fail: function (res) {
        console.log(res)
      }
    });
  }
});