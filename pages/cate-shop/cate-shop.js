const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    goods_list: [],
    page: 1,
    nomore: false,
    nodata: false,

    loading: false
  },
  onLoad(options) {
    this.data.id = options.id;
    wx.setNavigationBarTitle({ title: decodeURI(options.cate_name) });

    this.goodsList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 获取商品列表
  goodsList(complete) {
    let post = {
      cate_id: this.data.id,
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
  // 跳转详情
  to_detail(e) {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/shop-detail/shop-detail?id=' + e.currentTarget.dataset.id });
    });
  }
});