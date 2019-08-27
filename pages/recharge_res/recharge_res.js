Page({
  data: {
    res: false
  },
  onLoad: function (options) {
  },
  // 成功跳转
  succ_jump() {
    wx.switchTab({ url: '/pages/my/my' });
  },
  // 失败跳转
  fail_jump() {
    wx.switchTab({ url: '/pages/my/my' });
  }
})