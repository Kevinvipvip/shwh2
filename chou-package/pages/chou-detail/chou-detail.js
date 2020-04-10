var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    id: 0,
    funding: {},
    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad(options) {
    this.data.id = options.id;
    this.fundingDetail();
  },
  // 众筹详情
  fundingDetail() {
    app.ajax('funding/fundingDetail', {funding_id: this.data.id}, res => {
      app.time_format(res, 'start_time');
      app.time_format(res, 'end_time');
      app.format_img(res, 'cover');
      app.format_img(res, 'avatar');

      res.percent = Number(res.curr_money / res.need_money * 100).toFixed(1);
      app.qian_format(res, 'curr_money');
      app.qian_format(res, 'need_money');

      res.ago_text = res.time_count > 0 ? Math.ceil(res.time_count / 86400) + '天' : '已结束';

      this.setData({ funding: res });

      let rich_text = res.content;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  },
  // 去重置商品页
  to_support() {
    if (!app.user_data.uid) {
      this.setData({bind_tel_show: true});
    } else {
      wx.navigateTo({ url: '../support-options/support-options?funding_id=' + this.data.id });
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.funding.uid });
    });
  }
});