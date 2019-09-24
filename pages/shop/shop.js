const app = getApp();

Page({
  data: {
    full_loading: true,
    active_tab: -1,

    show_cart_icon: false,  // 是否显示购物车icon

    cate_list: [],

    goods_list: [],
    page: 1,
    nomore: false,
    nodata: false,

    loading: false
  },
  onLoad() {
    this.topCate(() => {
      this.goodsList(() => {
        this.setData({ full_loading: false });
      });
    });
    this.cartList();
  },
  // 全部商品
  all_goods() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.reset();

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.setData({ active_tab: -1 });
      this.goodsList(() => {
        this.data.loading = false;
        wx.hideLoading();
      });
    }
  },
  tab_change(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      this.reset();

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      this.setData({ active_tab: e.currentTarget.dataset.index });
      this.goodsList(() => {
        this.data.loading = false;
        wx.hideLoading();
      });
    }
  },
  topCate(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('shop/topCate', post, (res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].icon = app.my_config.base_url + '/' + res[i].icon;
      }
      this.setData({ cate_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取商品列表
  goodsList(complete) {
    let post = {
      pcate_id: this.data.active_tab === -1 ? 0 : this.data.cate_list[this.data.active_tab].id,
      page: this.data.page
    };

    app.ajax('shop/goodsList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            goods_list: [],
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
        app.format_img(res, 'cover');

        this.setData({ goods_list: this.data.goods_list.concat(res) });
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

      this.reset();

      wx.showNavigationBarLoading();
      this.goodsList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

        this.cartList();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.goodsList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置列表
  reset() {
    this.data.page = 1;
    this.data.goods_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 我的购物车，如果有商品则显示icon
  cartList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('shop/cartList', post, (res) => {
      this.setData({ show_cart_icon: res.length > 0 });
    });
  },
  onShareAppMessage(e) {
    wx.showShareMenu({
      withShareTicket: true,
      success: function () {
      }
    });
  },
  // 跳转详情
  to_detail(e) {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/shop-detail/shop-detail?id=' + e.currentTarget.dataset.id });
    });
  }
});