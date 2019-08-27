const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    left_height: 0,
    right_height: 0,
    left_shop_list: [],
    right_shop_list: [],
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
      token: app.user_data.token,
      cate_id: this.data.id,
      page: this.data.page
    };

    app.ajax(app.my_config.api + 'shop/goodsList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            left_shop_list: [],
            right_shop_list: [],
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
          res[i].cover = app.my_config.base_url + '/' + res[i].cover;

          if (this.data.left_height <= this.data.right_height) {
            this.data.left_shop_list.push(res[i]);
            this.data.left_height += res[i].height / res[i].width;
          } else {
            this.data.right_shop_list.push(res[i]);
            this.data.right_height += res[i].height / res[i].width;
          }
        }

        this.setData({
          left_shop_list: this.data.left_shop_list,
          right_shop_list: this.data.right_shop_list
        });
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

      this.data.left_height = 0;
      this.data.right_height = 0;
      this.data.nomore = false;
      this.data.nodata = false;
      this.data.page = 1;
      this.data.left_shop_list = [];
      this.data.right_shop_list = [];

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
  onShareAppMessage(e) {
    wx.showShareMenu({
      withShareTicket: true,
      success: function () {
      }
    });
  },
  // 跳转详情
  to_detail(e) {
    wx.navigateTo({ url: '/pages/shop-detail/shop-detail?id=' + e.currentTarget.dataset.id });
  }
})