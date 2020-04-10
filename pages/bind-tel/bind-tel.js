const app = getApp();

Page({
  data: {
    full_loading: true,

    tel: '',  // 手机号

    // 验证码相关
    code: '',
    code_text: '发送验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0
  },
  onLoad() {
    this.setData({ full_loading: false });
  },
  // 发送验证码
  sendSms() {
    if (!this.data.code_disabled) {
      if (!this.data.tel.trim()) {
        app.toast('请填写手机号');
      } else if (!app.my_config.reg.tel.test(this.data.tel)) {
        app.toast('手机号格式不正确');
      } else {
        this.setData({ code_disabled: true });

        app.ajax('login/sendSms', { tel: this.data.tel }, () => {
          app.toast('已发送');
          this.setData({ code_text: this.data.count_down + 's' });
          this.data.code_flag = setInterval(() => {
            this.data.count_down--;
            if (this.data.count_down === 0) {
              this.data.count_down = 60;
              this.setData({
                code_text: '发送验证码',
                code_disabled: false
              });
              clearInterval(this.data.code_flag);
            } else {
              this.setData({ code_text: this.data.count_down + 's' });
            }
          }, 1000)
        }, (err) => {
          app.toast(err.message);
          this.setData({ code_disabled: false });
        });
      }
    }
  },
  // 绑定手机号
  bindUser() {
    let data = this.data;

    if (!this.data.tel.trim()) {
      app.toast('请填写手机号');
    } else if (!app.my_config.reg.tel.test(this.data.tel)) {
      app.toast('手机号格式不正确');
    }  else if (!data.code.trim()) {
      app.toast('请填写验证码');
    }  else {
      let post = {
        tel: data.tel,
        code: data.code
      };

      wx.showLoading({
        title: '提交中',
        mask: true
      });
      app.ajax('login/bindUser', post, () => {
        app.set_user_data();
        app.modal('手机号绑定成功', () => {
          wx.navigateBack();
        });
      }, null, () => {
        wx.hideLoading();
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  }
});