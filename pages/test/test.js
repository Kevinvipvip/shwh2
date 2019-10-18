import drawQrcode from '../../utils/weapp.qrcode.min.js';
const app = getApp();

Page({
  data: {
    qrcode_img: ''
  },
  onLoad() {
    drawQrcode({
      width: 175,
      height: 175,
      correctLevel: 1,
      canvasId: 'card-qrcode',
      text: 'abcd'
    });

    setTimeout(() => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 175,
        height: 175,
        destWidth: 175,
        destHeight: 175,
        canvasId: 'card-qrcode',
        success: res => {
          this.setData({
            qrcode_img: res.tempFilePath
          });
          wx.hideLoading();
        },
        fail: () => {
          // 生成失败
          wx.hideLoading();
        }
      })
    }, 2000);
  }
});