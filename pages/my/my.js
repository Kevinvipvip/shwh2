const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
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
    this.mydetail(() => {
      this.setData({ full_loading: false });
    });
  },
  before_apply() {
    switch (this.data.user.role_check) {
      case 0:
        wx.navigateTo({ url: '/pages/before-apply/before-apply' });
        break;
      case 1:
      case 2:
      case 3:
        wx.navigateTo({ url: '/pages/apply2/apply2?role=0' });
        break;
    }
  },
  mydetail(complete) {
    app.ajax('my/mydetail', null, (res) => {
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
          res.role_text = '设计师';
          break;
        case 3:
          res.role_text = '工厂';
          break;
      }
      app.user_data.role = res.role;
      app.avatar_format(res);
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
    let date_text = utils.date_format(new Date(this.data.user.vip_time * 1000), 'yyyy年MM月dd日到期');
    app.modal('您的vip将于' + date_text);
  },
  // 授权
  auth(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
        mask: true
      });

      let inviter_id = wx.getStorageSync('inviter_id');

      app.userAuth(inviter_id, () => {
        wx.hideLoading();

        let type = e.currentTarget.dataset.type;
        if (type === 1) {
          // 授权登陆
          this.mydetail();
        } else {
          // 点击申请
          this.before_apply();
        }
      });
    }
  }
});