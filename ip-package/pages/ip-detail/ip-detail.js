var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0
  },
  onLoad(options) {
    this.data.id = options.id;

    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    console.log(rich_text, 'fuck');
    WxParse.wxParse('rich_text', 'html', rich_text, this);

    this.setData({ full_loading: false });
  }
});