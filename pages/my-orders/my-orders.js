const app = getApp()

Page({
  data: {
    full_loading: true,
    order_list: [],
    status: '',
    page: 1,
    nomore: false,
    nodata: false,
    loading: false,

    refund_show: false,
    reason: '',
    refund_order_sn: '',

    textarea_padding: '15rpx'
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    if (options.status) {
      this.setData({ status: parseInt(options.status) });
    }
    this.orderList(() => {
      this.setData({ full_loading: false });
    });
  },
  tab_change(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      this.setData({
        nomore: false,
        nodata: false
      });

      this.data.page = 1;
      this.data.order_list = [];

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.setData({ status: e.currentTarget.dataset.status });
      this.orderList(() => {
        this.data.loading = false;
        wx.hideLoading();
      });
    }
  },
  // 订单列表
  orderList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page
    };

    if (this.data.status !== '') {
      post.status = this.data.status;
    }

    app.ajax('my/orderList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            order_list: [],
            nomore: false,
            nodata: true
          });
        } else {
          this.setData({
            nomore: true,
            nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img_arr(res[i].child, 'cover');
          switch (res[i].status) {
            case 0:
              res[i].status_text = '待付款';
              break;
            case 1:
              res[i].status_text = '待发货';
              break;
            case 2:
              res[i].status_text = '待收货';
              break;
            case 3:
              res[i].status_text = '已完成';
              break;
          }
        }
        this.setData({ order_list: this.data.order_list.concat(res) });
      }

      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.nomore = false;
      this.data.nodata = false;
      this.data.page = 1;
      this.data.order_list = [];

      wx.showNavigationBarLoading();
      this.orderList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.orderList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 订单状态改变后刷新，区别于下拉刷新
  refresh() {
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.order_list = [];
    this.orderList();
  },
  // 确认收货
  orderConfirm(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认收货？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          let goods = e.currentTarget.dataset.goods;
          let post = {
            token: app.user_data.token,
            pay_order_sn: goods.pay_order_sn
          };
          app.ajax('my/orderConfirm', post, () => {
            wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + goods.id });
            that.refresh();
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    });
  },
  // 支付
  orderPay(e) {
    let that = this;
    let goods = e.currentTarget.dataset.goods;
    let post = {
      token: app.user_data.token,
      pay_order_sn: goods.pay_order_sn
    };

    app.ajax('pay/orderPay', post, (res) => {
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success() {
          wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + goods.id });
          that.refresh();
        },
        fail(err) {
          if (err.errMsg.indexOf('fail cancel')) {
            app.toast('取消支付')
          } else {
            app.toast('支付失败')
          }
        }
      })
    });
  },
  // 取消订单
  orderCancel(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '取消订单？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          let goods = e.currentTarget.dataset.goods;
          let post = {
            token: app.user_data.token,
            pay_order_sn: goods.pay_order_sn
          };
          app.ajax('my/orderCancel', post, () => {
            app.modal('订单已取消', () => {
              that.refresh();
            });
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    });
  },
  // 点击退款按钮
  refund_click(e) {
    let goods = e.currentTarget.dataset.goods;
    this.data.refund_order_sn = goods.pay_order_sn;
    this.setData({ refund_show: true });
  },
  // 申请退款
  refundApply() {
    let that = this;
    if (!that.data.reason.trim()) {
      app.toast('请填写退款理由');
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      let post = {
        token: app.user_data.token,
        pay_order_sn: that.data.refund_order_sn,
        reason: that.data.reason
      };
      app.ajax('my/refundApply', post, (res) => {
        that.setData({
          reason: '',
          refund_show: false
        });
        wx.navigateTo({ url: '/pages/refund-list/refund-list' });
        that.refresh();
      }, null, () => {
        wx.hideLoading();
      });
    }
  },
  do_nothing() {
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 隐藏退款框
  hide_refund() {
    this.setData({ refund_show: false });
  }
})