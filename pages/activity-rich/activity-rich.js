var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    id: 0
  },
  onLoad(options) {
    this.data.id = options.id;
    this.getReqDetail();
  },
  // 获取活动详情
  getReqDetail() {
    app.ajax('api/getReqDetail', {req_id: this.data.id}, (res) => {
      this.setData({req: res});

      let rich_text = res.explain;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  }
});