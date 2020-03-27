const app = getApp();

Page({
  data: {
    full_loading: true,

    type: 1,  // 1.发起众筹 2.IP申请详情页

    form: {
      com_name: '',  // 公司名称
      chou_name: '',  // 众筹名称
      tel: '',  // 手机号
      code: '',  // 验证码
      email: ''  // 邮箱
    },

    // 验证码相关
    code_text: '获取验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0
  },
  onLoad(options) {
    this.data.type = parseInt(options.type);
    switch (this.data.type) {
      case 1:
        wx.setNavigationBarTitle({ title: '填写申请信息' });
        break;
      case 2:
        wx.setNavigationBarTitle({ title: '授权申请' });
        break;
    }

    this.setData({ full_loading: false });
  }
});