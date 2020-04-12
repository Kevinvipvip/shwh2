const app = getApp();

Page({
  data: {
    full_loading: true,

    search: '',
    page: 1,
    goods_list: [],  // 爆款推荐
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.goodsList(() => {
      this.setData({ full_loading: false });
    });
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 搜索商品
  search_goods() {
    let search = this.data.search.trim();
    if (search) {
      for (let i = 0; i < this.data.goods_list.length; i++) {
        this.data.goods_list[i].visible = this.data.goods_list[i].name.indexOf(search) !== -1;
      }
    } else {
      for (let i = 0; i < this.data.goods_list.length; i++) {
        this.data.goods_list[i].visible = true;
      }
    }
    this.setData({ goods_list: this.data.goods_list });
  },
  // 获取列表
  goodsList(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('api/goodsList', post, res => {
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
        app.format_img(res, 'poster');
        for (let i = 0; i < res.length; i++) {
          res[i].visible = true;
        }
        this.setData({ goods_list: this.data.goods_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

      this.reset();
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
  // 重置
  reset() {
    this.data.page = 1;
    this.data.goods_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  }
});