const app = getApp()

Page({
  data: {
    full_loading: true,
    id: 0,
    order: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.orderDetail(() => {
      this.setData({full_loading: false});
    });
  },
  orderDetail(complete) {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax('my/orderDetail', post, (res) => {
      app.format_img_arr(res.child, 'cover');
      let amount = 0;
      for (let i = 0; i < res.child.length; i++) {
        amount  += res.child[i].num;
      }
      res.amount = amount;
      switch (res.status) {
        case 0:
          res.status_text = '待付款';
          break;
        case 1:
          res.status_text = '待发货';
          break;
        case 2:
          res.status_text = '待收货';
          break;
        case 3:
          res.status_text = '已完成';
          break;
      }
      this.setData({order: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  copy() {
    let that = this;
    wx.setClipboardData({
      data: that.data.order.pay_order_sn,
      success() {
        app.toast('已复制到剪贴板');
      }
    })
  }
})