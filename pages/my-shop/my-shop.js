const app = getApp();

Page({
  data: {
    status: 1,  // 1.没设置过账号 2.设置过账号
    type: 1,
    full_loading: true,
    admin_url: 'http://caves.wcip.net/user/',

    username: '',
    password: '',
    repass: '',
    order_email: '',

    loading: false
  },
  onLoad() {
    this.setData({
      username: app.user_data.username || '',
      order_email: app.user_data.order_email || '',
    });

    if (app.user_data.username) {
      this.setData({
        status: 2,
        full_loading: false
      });
    } else {
      this.setData({ full_loading: false });
    }
  },
  // 切换tab
  tab_change(e) {
    this.setData({ type: e.currentTarget.dataset.type });
  },
  // 设置账号-密码
  setAccount() {
    let data = this.data;

    if (!data.username.trim()) {
      app.toast('请输入用户名');
    } else if (!data.password.trim()) {
      app.toast('请输入密码');
    } else if (data.password.length < 6) {
      app.toast('密码至少6位');
    } else if (data.password !== data.repass) {
      app.toast('两次输入的密码不一致');
    } else {
      wx.showLoading({ mask: true });

      let post = {
        username: this.data.username,
        password: this.data.password
      };
      app.ajax('my/setAccount', post, () => {
        wx.hideLoading();
        app.modal('密码设置完成', () => {
          this.setData({
            status: 2,
            type: 3
          });
          app.set_user_data();
        });
      });
    }
  },
  // 修改密码
  setPasswd() {
    let data = this.data;

    if (!data.password.trim()) {
      app.toast('请输入密码');
    } else if (data.password.length < 6) {
      app.toast('密码至少6位');
    } else if (data.password !== data.repass) {
      app.toast('两次输入的密码不一致');
    } else {
      wx.showLoading({ mask: true });

      app.ajax('my/setPasswd', { password: this.data.password }, () => {
        wx.hideLoading();
        app.modal('新密码已保存', () => {
          this.setData({ type: 3 });
        });
        app.set_user_data();
      });
    }
  },
  // 设置订单通知邮箱
  setOrderEmail() {
    let data = this.data;

    if (!data.order_email.trim()) {
      app.toast('邮箱不能为空');
    } else if (!app.my_config.reg.email.test(data.order_email)) {
      app.toast('请输入正确的邮箱');
    } else {
      wx.showLoading({ mask: true });

      app.ajax('my/setOrderEmail', { email: this.data.order_email }, () => {
        wx.hideLoading();
        app.modal('邮箱已保存');
        app.set_user_data();
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 复制
  copy() {
    app.copy(this.data.admin_url);
  }
});