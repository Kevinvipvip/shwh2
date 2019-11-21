var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
  },
  onLoad() {
    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    WxParse.wxParse('rich_text', 'html', rich_text, this);
  }
});