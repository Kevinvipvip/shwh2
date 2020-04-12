const app = getApp();

Page({
  data: {
    full_loading: true,
    user: {},
    apply: {},
    role: 0
  },
  onLoad() {
    this.setData({ full_loading: false });
  },
  onShow() {
    this.setData({ role: app.user_data.role });
    this.applyInfo();
    this.myDetail();
  },
  // 我的申请信息
  applyInfo() {
    app.ajax('my/applyInfo', null, res => {
      if (!(res instanceof Array)) {
        this.setData({ apply: res });
      }
    });
  },
  // 跳转申请页，判断用户是否申请过角色
  before_apply() {
    if (this.data.apply.role_check) {
      wx.navigateTo({ url: '/pages/apply2/apply2' });
    } else {
      wx.navigateTo({ url: '/pages/apply/apply' });
    }
  },
  myDetail(complete) {
    app.ajax('my/myDetail', null, (res) => {
      switch (res.role) {
        case 1:
          res.role_text = '文旅机构';
          break;
        case 2:
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
  // 去编辑个人资料页
  to_my_edit() {
    wx.navigateTo({ url: '/pages/my-edit/my-edit' });
  }
});