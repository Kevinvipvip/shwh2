const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',
    title: '',
    content: ''
  },
  onLoad() {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  }
});