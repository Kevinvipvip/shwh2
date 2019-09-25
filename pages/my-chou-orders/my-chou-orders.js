const app = getApp();

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
    refund_order_id: 0,

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

    this.fundingOrderList(() => {
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
      this.fundingOrderList(() => {
        this.data.loading = false;
        wx.hideLoading();
      });
    }
  },
  // 订单列表
  fundingOrderList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page
    };

    if (this.data.status !== '') {
      post.status = this.data.status;
    }

    app.ajax('my/fundingOrderList', post, (res) => {
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
        app.format_img(res, 'cover');
        app.time_format(res, 'create_time', 'yyyy-MM-dd hh:mm:ss');
        for (let i = 0; i < res.length; i++) {
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
      this.fundingOrderList(() => {
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
        this.fundingOrderList(() => {
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
    this.fundingOrderList();
  },
  // 确认收货
  fundingOrderConfirm(e) {
    wx.showModal({
      title: '提示',
      content: '确认收货？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          let goods = e.currentTarget.dataset.goods;
          let post = {
            token: app.user_data.token,
            order_id: goods.id
          };
          app.ajax('my/fundingOrderConfirm', post, () => {
            wx.navigateTo({ url: '/pages/order-chou-detail/order-chou-detail?id=' + goods.id });
            this.refresh();
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    });
  },
  // 支付
  orderPay(e) {
    app.collectFormid(e.detail.formId);

    let goods = e.currentTarget.dataset.goods;
    let post = {
      pay_order_sn: goods.pay_order_sn
    };

    app.ajax('pay/fundingPay', post, res => {
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success: () => {
          wx.navigateTo({ url: '/pages/order-chou-detail/order-chou-detail?id=' + goods.id });
          this.refresh();
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
  // 取消订单
  fundingOrderCancel(e) {
    wx.showModal({
      title: '提示',
      content: '取消订单？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          let goods = e.currentTarget.dataset.goods;
          let post = {
            token: app.user_data.token,
            order_id: goods.id
          };
          app.ajax('my/fundingOrderCancel', post, () => {
            app.modal('订单已取消', () => {
              this.refresh();
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
    this.data.refund_order_id = goods.id;
    this.setData({ refund_show: true });
  },
  // 申请退款
  fundingRefundApply() {
    if (!this.data.reason.trim()) {
      app.toast('请填写退款理由');
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      let post = {
        token: app.user_data.token,
        order_id: this.data.refund_order_id,
        reason: this.data.reason
      };
      app.ajax('my/fundingRefundApply', post, res => {
        this.setData({
          reason: '',
          refund_show: false
        });
        wx.navigateTo({ url: '/pages/chou-refund-list/chou-refund-list' });
        this.refresh();
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
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 隐藏退款框
  hide_refund() {
    this.setData({ refund_show: false });
  },
  // 去众筹页
  to_chou_detail(e) {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/chou-detail/chou-detail?id=' + e.currentTarget.dataset.funding_id });
    });
  },
  // 去订单详情页
  to_order_detail(e) {
    wx.navigateTo({ url: '/pages/order-chou-detail/order-chou-detail?id=' + e.currentTarget.dataset.id });
  }
});