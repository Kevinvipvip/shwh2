var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    ip: {}
  },
  onLoad(options) {
    this.data.id = options.id;

    this.ipDetail(() => {
      this.setData({full_loading: false});
    });
  },
  // 版权详情
  ipDetail(complete) {
    app.ajax('copyright/ipDetail', {ip_id: this.data.id}, res => {
      app.format_img(res, 'cover');
      this.setData({ip: res});

      let rich_text = res.content;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  }
});