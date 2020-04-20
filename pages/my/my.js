const app = getApp();

Page({
  data: {
    full_loading: true,
    first: true,

    user: {},
    apply: {},
    role: 0,

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad() {
    this.init(() => {
      this.data.first = false;
      this.setData({ full_loading: false });
    });
  },
  onShow() {
    if (!this.data.first) {
      this.init();
    }
  },
  init(complete) {
    // 我的详情
    let promise1 = new Promise(resolve => {
      this.myDetail(() => {
        resolve();
      });
    });

    // 申请信息
    let promise2 = new Promise(resolve => {
      this.applyInfo(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 我的申请信息
  applyInfo(complete) {
    app.ajax('my/applyInfo', null, res => {
      if (!(res instanceof Array)) {
        this.setData({ apply: res });
      }
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 跳转申请页，判断用户是否申请过角色
  before_apply() {
    app.check_bind(() => {
      if (this.data.apply.role_check) {
        wx.navigateTo({ url: '/pages/apply2/apply2' });
      } else {
        wx.navigateTo({ url: '/pages/apply/apply' });
      }
    });
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
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;
      wx.showNavigationBarLoading();
      this.init(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 去编辑个人资料页
  to_my_edit() {
    wx.navigateTo({ url: '/pages/my-edit/my-edit' });
  },
  // 去会员中心页
  to_vip() {
    if (!app.user_data.uid) {
      this.setData({ bind_tel_show: true });
    } else {
      wx.navigateTo({ url: '/pages/vip-center/vip-center' });
    }
  },
  // 绑定手机号弹窗
  bind_tel() {
    this.setData({ bind_tel_show: true });
  },
  // 跳页
  jump(e) {
    app.check_bind(() => {
      let url = e.currentTarget.dataset.url;
      wx.navigateTo({ url });
    });
  }
});