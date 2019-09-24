const app = getApp();

Page({
  data: {
    status: 1,
    // protocol_show: false,
    // agree: false,
    full_loading: true,
    admin_url: 'http://caves.wcip.net/user/',

    username: '',
    password: '',
    repass: '',

    loading: false
  },
  onLoad() {
    if (app.user_data.username) {
      this.setData({
        username: app.user_data.username || '',
        status: 3
      }, () => {
        this.setData({ full_loading: false });
      });
    } else {
      this.setData({ full_loading: false });
    }
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
          this.setData({ status: 2 });
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
          this.setData({ status: 2 });
        });
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