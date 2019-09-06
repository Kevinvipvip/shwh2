const app = getApp();

Page({
  data: {
    receiver: '这是昵称',
    tel: '13114857103',
    address: '天津市河西区爱国道生辉里3门404',
    textarea_padding: '15rpx',

    desc: ''
  },
  onLoad(options) {
    // textarea
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }
  }
});