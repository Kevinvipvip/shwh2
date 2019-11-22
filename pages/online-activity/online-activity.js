var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    ac_info: {},
    info1_visible: true,
    info2_visible: true,

    name: ''
  },
  onLoad() {
    this.getAcInfo(() => {
      this.setData({full_loading: false});
    });
  },
  // 获取活动详情
  getAcInfo(complete) {
    app.ajax('api/getAcInfo', null, res => {
      app.format_img(res.pics);
      this.setData({ac_info: res});

      let rich_text = res.content;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 显示/隐藏信息
  toggle_info(e) {
    let no = e.currentTarget.dataset.no;
    if (no === '1') {
      this.setData({info1_visible: !this.data.info1_visible});
    } else {
      this.setData({info2_visible: !this.data.info2_visible});
    }
  },
  // 选择性别
  sex_choose(e) {
    console.log(e.detail.value);
  }
});