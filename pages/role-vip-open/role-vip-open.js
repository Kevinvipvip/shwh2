const app = getApp();

Page({
  data: {
    full_loading: true,
    role_vip: 0,
    role_vip_time: 0,

    role: 0,
    level: 0,  // 0.普通会员 1.VIP会员 2.超级会员
    level_list: [],
    long_list: []
  },
  onLoad() {
    this.setData({
      role: app.user_data.role,
      role_vip: app.user_data.role_vip,
      role_vip_time: app.user_data.role_vip_time
    });
    this.roleVipList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 选择
  choose(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({ level: index });
  },
  // 会员种类
  roleVipList(complete) {
    app.ajax('my/roleVipList', null, res => {
      app.format_img(res);
      this.setData({ level_list: res });
    }, null, complete);
  },
  // 会员充值下单
  roleVipRecharge() {
    wx.showLoading({
      title: '充值中...',
      mask: true
    });

    let vip_id = this.data.level_list[this.data.level].id;
    let vip_price = this.data.level_list[this.data.level].price;

    app.ajax('my/roleVipRecharge', { vip_id: vip_id }, res => {
      if (vip_price === '0.00') {
        app.set_user_data(() => {
          app.modal('充值成功', () => {
            wx.switchTab({ url: '/pages/my/my' });
          });
        });
      } else {
        this.roleVipPay(res.order_sn, pay_res => {
          if (pay_res) {
            app.set_user_data(() => {
              app.modal('充值成功', () => {
                wx.switchTab({ url: '/pages/my/my' });
              });
            });
          }
        }, null, () => {
          wx.hideLoading();
        });
      }
    }, null, () => {
      wx.hideLoading();
    });
  },
  // 会员支付
  roleVipPay(order_sn, complete) {
    app.ajax('pay/roleVipPay', { order_sn }, (res) => {
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