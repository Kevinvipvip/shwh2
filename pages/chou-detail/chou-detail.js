const app = getApp();

Page({
  data: {
    id: 0,
    funding: {}
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

      app.format_img(res.works_pics);
      app.avatar_format(res, 'avatar');

      res.ago_text = Math.ceil(res.time_count / 86400);

      this.setData({funding: res});
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