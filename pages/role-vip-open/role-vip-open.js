const app = getApp();

Page({
  data: {
    role: 0,
    ban: 0,  // -1.未选择 0.标准版 1.乐享版 2.智慧版
    long: 0,  // -1.未选择 0.一年 1.三年
    level: {},
    level_list: [],
    long_list: []
  },
  onLoad() {
    this.setData({ role: app.user_data.role });
    this.getRole3LevelList();
  },
  // 选择
  choose(e) {
    let ban = e.currentTarget.dataset.ban;
    let long = e.currentTarget.dataset.long;

    if (ban !== undefined) {
      this.setData({ ban }, () => {
        this.setData({ long_list: this.data.level_list.slice(ban * 2, ban * 2 + 2) });
      });
    } else {
      this.setData({ long });
    }

    this.setData({ level: this.data.level_list[this.data.ban * 2 + this.data.long] });
  },
  // 工厂购买套餐列表
  getRole3LevelList() {
    app.ajax('api/getRole3LevelList', null, res => {
      for (let i = 0; i < res.length; i++) {
        res[i].price = app.num_zheng(res[i].price);
      }
      this.setData({ level_list: res }, () => {
        this.setData({
          long_list: this.data.level_list.slice(0, 2),
          level: this.data.level_list[0]
        });
      });
    });
  },
  // 工厂购买套餐下单
  role3Recharge() {
    wx.showLoading({
      title: '充值中...',
      mask: true
    });

    app.ajax('api/role3Recharge', { level_id: this.data.level.id }, res => {
      this.role3Pay(res, pay_res => {
        wx.hideLoading();

        if (pay_res) {
          app.modal('开通成功', () => {
            wx.switchTab({ url: '/pages/my/my' });
          });
        }
      });
    });
  },
  // 工厂购买套餐支付
  role3Pay(pay_order_sn, complete) {
    app.ajax('pay/role3Pay', { pay_order_sn }, (res) => {
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success() {
          complete(true);
        },
        fail() {
          app.toast('支付失败');
          complete(false);
        }
      })
    });
  }
});