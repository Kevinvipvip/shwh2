var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    ip: {}
  },
  onLoad(options) {
    this.setData({ id: options.id });

    this.ipDetail(() => {
      this.setData({ full_loading: false });
    });
  },
  // 版权详情
  ipDetail(complete) {
    app.ajax('copyright/ipDetail', { ip_id: this.data.id }, res => {
      app.format_img(res, 'cover');
      this.setData({ ip: res });
      wx.setNavigationBarTitle({ title: res.title });

      let rich_text = res.content;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 全屏查看版权图片
  preview_pic() {
    wx.previewImage({
      urls: [this.data.ip.cover]
    });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});