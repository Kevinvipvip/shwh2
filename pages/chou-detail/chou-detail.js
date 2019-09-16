var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    id: 0,
    funding: {},
    flex_pad: []
  },
  onLoad(options) {
    this.data.id = options.id;
    this.fundingDetail();
  },
  // 众筹详情
  fundingDetail() {
    app.ajax('api/fundingDetail', {id: this.data.id}, res => {
      app.time_format(res, 'start_time');
      app.time_format(res, 'end_time');
      app.format_img(res, 'cover');

      res.percent = Number(res.curr_money / res.need_money * 100).toFixed(1);
      app.qian_format(res, 'curr_money');
      app.qian_format(res, 'need_money');

      app.avatar_format(res, 'avatar');
      res.works_pics = res.works_pics.slice(0, 3);
      app.format_img(res.works_pics);
      let flex_pad = app.null_arr(res.works_pics.length, 3);

      res.ago_text = Math.ceil(res.time_count / 86400);

      this.setData({
        funding: res,
        flex_pad: flex_pad
      });

      let rich_text = res.req_detail;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  },
  // 去重置商品页
  to_support() {
    wx.navigateTo({ url: '/pages/support-options/support-options?funding_id=' + this.data.id });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});