const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播

    active_index: 2,  // 1.小批量 2.免拿样 3.免开模
    page: 1,
    goods_list: [],
    nomore: false,
    nodata: false
  },
  onLoad() {
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 轮播
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    // 商品列表
    let promise2 = new Promise(resolve => {
      this.goodsList(() => {
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
  // 获取轮播图
  slideList(complete) {
    app.ajax('api/slideList2', null, res => {
      app.format_img(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // tab切换
  tab_change(e) {
    this.setData({ active_index: e.currentTarget.dataset.tab }, () => {
      this.reset();
      this.goodsList();
    });
  },
  // 获取列表
  goodsList(complete) {
    let post = {
      type: this.data.active_index,
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