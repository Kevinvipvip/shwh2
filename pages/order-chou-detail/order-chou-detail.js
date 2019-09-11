const app = getApp();

Page({
  data: {
    full_loading: true,
    id: 0,
    order: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.fundingOrderDetail(() => {
      this.setData({full_loading: false});
    });
  },
  fundingOrderDetail(complete) {
    app.ajax('my/fundingOrderDetail', {order_id: this.data.id}, (res) => {
      app.format_img(res, 'cover');
      app.time_format(res, 'create_time', 'yyyy-MM-dd');
      app.time_format(res, 'pay_time', 'yyyy-MM-dd');

      if (res.type === 1) {
        app.format_img(res.pics);
      }

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
    wx.setClipboardData({
      data: this.data.order.pay_order_sn,
      success() {
        app.toast('已复制到剪贴板');
      }
    });
  }
});