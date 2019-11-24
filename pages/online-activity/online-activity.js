var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    ac_info: {},
    info1_visible: true,
    info2_visible: true,

    tel: '',  // 手机号
    name: '',  // 姓名
    sex: 1,  // 1.男 0.女
    num: '',  // 人数
    weixin: '',  // 微信号

    // 验证码相关
    code: '',
    code_text: '发送验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0
  },
  onLoad() {
    this.getAcInfo(() => {
      this.setData({ full_loading: false });
    });
  },
  // 获取活动详情
  getAcInfo(complete) {
    app.ajax('api/getAcInfo', null, res => {
      app.format_img(res.pics);
      this.setData({ ac_info: res });

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
      this.setData({ info1_visible: !this.data.info1_visible });
    } else {
      this.setData({ info2_visible: !this.data.info2_visible });
    }
  },
  // 选择性别
  sex_choose(e) {
    this.setData({ sex: parseInt(e.detail.value) });
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

        app.ajax('api/joinAcSendSms', { tel: this.data.tel }, () => {
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
  bind_input(e) {
    app.bind_input(e, this);
  },
  joinAc() {
    let data = this.data;

    if (!data.name.trim()) {
      app.toast('请填写姓名');
    } else if (!data.num) {
      app.toast('请填写参与人数');
    } else if (!data.tel.trim()) {
      app.toast('请填写手机号');
    } else if (!app.my_config.reg.tel.test(data.tel)) {
      app.toast('手机号格式不正确');
    } else if (!data.code.trim()) {
      app.toast('请填写验证码');
    }  else {
      let post = {
        tel: data.tel,
        name: data.name,
        sex: data.sex,
        num: data.num,
        code: data.code,
        weixin: data.weixin
      };

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      app.ajax('api/joinAc', post, () => {
        app.modal('报名成功', () => {
          wx.redirectTo({ url: '/pages/sign-res/sign-res' });
        });
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  }
});