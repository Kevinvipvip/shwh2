Page({
  data: {
    // textarea
    textarea_padding: '15rpx',

    // nomore/nodata
    nomore: false,
    nodata: true
  },
  onLoad() {
    // textarea
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }
  }
});