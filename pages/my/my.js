const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    auth: false,
    full_loading: true,
    user: {}
  },
  onLoad() {
    this.setData({
      statusBarHeight: app.my_config.statusBarHeight,
      topBarHeight: app.my_config.topBarHeight
    });
  },
  onShow() {
    // utils.select_tab_bar(this, 2);
    this.mydetail(() => {
      this.setData({ full_loading: false });
    });
  },
  before_apply() {
    switch (this.data.user.auth) {
      case 0:
        wx.navigateTo({ url: '/pages/before-apply/before-apply' });
        break;
      case 1:
      case 3:
        wx.navigateTo({ url: '/pages/apply2/apply2?role=0' });
        break;
    }
  },
  mydetail(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax(app.my_config.api + 'my/mydetail', post, (res) => {
      switch (res.sex) {
        case 0:
          res.sex_text = '未知';
          break;
        case 1:
          res.sex_text = '男';
          break;
        case 2:
          res.sex_text = '女';
          break;
      }

      switch (res.role) {
        case 1:
          res.role_text = '博物馆';
          break;
        case 2:
          res.role_text = '文创机构';
          break;
        case 3:
          res.role_text = '设计师';
          break;
        case 4:
          res.role_text = '工厂';
          break;
      }
      app.user_data.role = res.role;

      res.avatar = res.avatar.indexOf('https') === 0 ? res.avatar : app.my_config.base_url + '/' + res.avatar;

      this.setData({ user: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    wx.showLoading({ title: '刷新中' });
    this.mydetail(() => {
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },
  vip_date() {
    let date_text = utils.date_format('yyyy年MM月dd日到期', new Date(this.data.user.vip_time * 1000));
    app.modal('您的vip将于' + date_text);
  }
})