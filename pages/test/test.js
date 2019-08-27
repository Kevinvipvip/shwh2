import drawQrcode from '../../utils/weapp.qrcode.min.js';

const app = getApp();

Page({
  data: {
    cc: ''
  },
  onLoad() {
    drawQrcode({
      width: 150,
      height: 150,
      correctLevel: 1,
      canvasId: 'myQrcode',
      text: '72e13da254c7b485c9646c2d7d8a1865'
    });

    var canvas = wx.createCanvasContext('myQrcode');
    var that = this;

    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 150,
        height: 150,
        destWidth: 150,
        destHeight: 150,
        canvasId: 'myQrcode',
        success: function (res) {
          console.log(res);
          that.setData({cc: res.tempFilePath});
        },
        fail(res) {
          console.log(res);
          // 生成失败
        }
      })
    }, 500)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})