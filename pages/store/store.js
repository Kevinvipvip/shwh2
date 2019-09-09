var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

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

    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    WxParse.wxParse('rich_text', 'html', rich_text, this);
  }
});