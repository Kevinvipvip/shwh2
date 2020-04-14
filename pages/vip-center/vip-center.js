const app = getApp();

Page({
  data: {
    full_loading: true,

    vip_price: 0,  // 会员价
    vip: 0,  // 0.不是会员 1.是会员
    vip_time: '',  // 会员到期时间

    page: 1,
    tehui_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // vip价格等信息
    let promise1 = new Promise(resolve => {
      this.mydetail(() => {
        resolve();
      });
    });

    // 精选特惠
    let promise2 = new Promise(resolve => {
      this.tehuiList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取个人信息（获取vip价格，是否是会员，会员到期时间）
  mydetail(complete) {
    app.ajax('my/mydetail', null, res => {
      app.format_time(res, 'vip_time', 'yyyy-MM-dd');

      this.setData({
        vip_price: res.vip_price,
        vip: res.vip,
        vip_time: res.vip_time
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // vip下单
  recharge() {
    wx.showLoading({
      title: '支付中...',
      mask: true
    });

    app.ajax('my/recharge', null, res => {
      this.vipPay(res.order_sn, pay_res => {
        wx.hideLoading();

        if (pay_res) {
          app.modal(this.data.vip === 0 ? '开通成功' : '续费成功', () => {
            this.mydetail();
            app.set_user_data();

            let goods_page = app.get_page('pages/shop-detail/shop-detail');
            if (goods_page) {
              goods_page.vip_refresh();
            }
          });
        }
      });
    });
  },
  // 充值付款
  vipPay(order_sn, complete) {
    app.ajax('pay/vipPay', { order_sn }, res => {
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
  },
  // 精选特惠
  tehuiList(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('shop/tehuiList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            tehui_list: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nodata: false,
            nomore: true
          });
        }
      } else {
        app.format_img(res, 'poster');
        app.format_img(res.pics);

        this.setData({ tehui_list: this.data.tehui_list.concat(res) });
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

      wx.showNavigationBarLoading();

      this.reset();
      this.init(() => {
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
        this.tehuiList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.tehui_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  }
});