var WxParse = require('../../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    id: 0,
    activity: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.activityDetail();
  },
  // 获取活动详情
  activityDetail() {
    app.ajax('activity/activityDetail', {activity_id: this.data.id}, res => {
      this.setData({activity: res});

      let rich_text = res.explain;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  }
});