const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图

    jing_list: [],  // 特惠推荐
    jing_flex: [],

    page: 1,
    xia_list: [],  // 特惠下方列表
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
    // 轮播
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    // 特惠推荐
    let promise2 = new Promise(resolve => {
      this.jingList(() => {
        resolve();
      });
    });

    // 特惠下方列表
    let promise3 = new Promise(resolve => {
      this.xiaList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 轮播图
  slideList(complete) {
    app.ajax('shop/slideList', null, res => {
      app.format_img(res);
      this.setData({ slide_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 精选特惠
  tehuiList(post, success, complete) {
    app.ajax('shop/tehuiList', post, res => {
      app.format_img(res, 'poster');
      app.format_img(res.pics);
      success(res);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 特惠精选
  jingList(complete) {
    this.tehuiList({recommend: 1}, res => {
      this.setData({
        jing_list: res,
        jing_flex: app.null_arr(res.length, 3)
      });
    }, complete);
  },
  // 特惠下方列表
  xiaList(complete) {
    let post = {
      page: this.data.page,
      recommend: 0
    };

    this.tehuiList(post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            xia_list: [],
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
        this.setData({ xia_list: this.data.xia_list.concat(res) });
      }
      this.data.page++;
    }, complete);
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
        this.xiaList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.xia_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  }
});