const app = getApp();

Page({
  data: {
    ip_id: 0,

    title: '',  // 赛事标题
    company: '',  // 举办单位
    name: '',  // 联系人
    tel: '',  // 联系电话
    code: '',  // 验证码
    email: '',  // 邮箱

    // 验证码相关
    code_text: '获取验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0
  },
  onLoad(options) {
    if (options.id) {
      this.setData({ip_id: parseInt(options.id)});
    }
  },
  // 发送验证码
  sendSms() {
    if (!this.data.code_disabled) {
      if (!this.data.tel.trim()) {
        app.toast('请填写联系电话');
      } else if (!app.my_config.reg.tel.test(this.data.tel)) {
        app.toast('手机号格式不正确');
      } else {
        this.setData({ code_disabled: true });

        app.ajax('activity/sendSms', { tel: this.data.tel }, () => {
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
  // 表单提交
  activityRelease() {
    let data = this.data;

    if (!data.company.trim()) {
      app.toast('请填写举办单位');
    } else if (!data.title.trim()) {
      app.toast('请填写赛事标题');
    } else if (!data.name.trim()) {
      app.toast('请填写联系人');
    } else if (!data.tel.trim()) {
      app.toast('请填写联系电话');
    } else if (!app.my_config.reg.tel.test(data.tel)) {
      app.toast('请填写正确的联系电话');
    } else if (!data.code.trim()) {
      app.toast('请填写验证码');
    } else if (!data.email.trim()) {
      app.toast('请填写邮箱');
    } else if (!app.my_config.reg.email.test(data.email)) {
      app.toast('请填写正确的邮箱');
    } else {

      let post = {
        title: data.title,
        company: data.company,
        name: data.name,
        tel: data.tel,
        code: data.code,
        email: data.email
      };

      wx.showLoading({
        title: '提交中',
        mask: true
      });
      app.ajax('activity/activityRelease', post, () => {
        app.modal('提交成功！我们会尽快与您联系', () => {
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