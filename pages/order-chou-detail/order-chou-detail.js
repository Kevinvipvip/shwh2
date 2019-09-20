const app = getApp();

Page({
  data: {
    full_loading: true,
    id: 0,
    order: {},
    flex_pad: [],

    refund_show: false,
    reason: '',
    refund_order_id: 0,
  },
  onLoad(options) {
    this.data.id = options.id;
    this.fundingOrderDetail(() => {
      this.setData({ full_loading: false });
    });

    this.setData({ is_ios: app.is_ios });
  },
  // 订单详情
  fundingOrderDetail(complete) {
    app.ajax('my/fundingOrderDetail', { order_id: this.data.id }, (res) => {
      app.format_img(res, 'cover');
      app.time_format(res, 'create_time', 'yyyy-MM-dd hh:mm:ss');
      app.time_format(res, 'pay_time', 'yyyy-MM-dd hh:mm:ss');
      app.time_format(res, 'send_time', 'yyyy-MM-dd hh:mm:ss');
      app.time_format(res, 'finish_time', 'yyyy-MM-dd hh:mm:ss');
      app.time_format(res, 'refund_time', 'yyyy-MM-dd hh:mm:ss');
      
      if (res.type === 1) {
        app.format_img(res.pics);
        this.setData({ flex_pad: app.null_arr(res.pics.length, 3) });
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
      this.setData({ order: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 复制
  copy() {
    wx.setClipboardData({
      data: this.data.order.pay_order_sn,
      success: () => {
        app.toast('已复制到剪贴板');
      }
    });
  },
  // 去众筹页
  to_chou_detail() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/chou-detail/chou-detail?id=' + this.data.order.funding_id });
    });
  },
  // 取消订单
  fundingOrderCancel() {
    wx.showModal({
      title: '提示',
      content: '取消订单？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ mask: true });
          app.ajax('my/fundingOrderCancel', { order_id: this.data.order.id }, () => {
            app.modal('订单已取消', () => {
              this.fundingOrderDetail();
            });
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    });
  },
  // 支付
  orderPay() {
    app.ajax('pay/fundingPay', { pay_order_sn: this.data.order.pay_order_sn }, res => {
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success: () => {
          this.fundingOrderDetail();
        },
        fail(err) {
          if (err.errMsg.indexOf('fail cancel')) {
            app.toast('取消支付');
          } else {
            app.toast('支付失败');
          }
        }
      })
    });
  },
  // 点击退款按钮
  refund_click() {
    this.setData({ refund_show: true });
  },
  // 申请退款
  fundingRefundApply() {
    if (!this.data.reason.trim()) {
      app.toast('请填写退款理由');
    } else {
      wx.showLoading({ mask: true });
      let post = {
        order_id: this.data.id,
        reason: this.data.reason
      };
      app.ajax('my/fundingRefundApply', post, () => {
        this.setData({
          reason: '',
          refund_show: false
        });
        this.fundingOrderDetail();
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  },
  do_nothing() {
  },
  bind_input(e) {
    app.bind_input();
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 隐藏退款框
  hide_refund() {
    this.setData({ refund_show: false });
  },
  // 确认收货
  fundingOrderConfirm() {
    wx.showModal({
      title: '提示',
      content: '确认收货？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          app.ajax('my/fundingOrderConfirm', {order_id: this.data.id}, () => {
            this.fundingOrderDetail();
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    });
  }
});