const app = getApp();

Page({
  data: {
    full_loading: true,

    custom_active: 2,  // 1.小批量 2.免拿样 3.免开模

    slide_list: [],  // 轮播

    video_top: {},  // 视屏精选 - 大视频
    video_list: [],  // 视频精选 - 下方视频

    ding_list: [],  // 定制专区

    page: 1,
    bao_list: [],  // 爆款推荐
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    // 检测小程序更新
    app.mp_update();

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

    // 视频精选
    let promise2 = new Promise(resolve => {
      this.videoList(() => {
        resolve();
      });
    });

    // 定制专区 - 小批量
    let promise3 = new Promise(resolve => {
      this.dingList(() => {
        resolve();
      });
    });

    // 爆款商品
    let promise4 = new Promise(resolve => {
      this.baoList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3, promise4
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取轮播图
  slideList(complete) {
    app.ajax('api/slideList', null, res => {
      app.format_img(res);
      this.setData({slide_list: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 视频精选
  videoList(complete) {
    app.ajax('api/videoList', null, res => {
      app.format_img(res, 'poster');
      app.format_img(res, 'video_url');
      this.setData({
        video_top: res[0],
        video_list: res.slice(1)
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 商品列表
  goodsList(post, success, complete) {
    app.ajax('api/goodsList', post, res => {
      app.format_img(res, 'poster');
      success(res);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // tab切换
  tab_change(e) {
    this.setData({custom_active: e.currentTarget.dataset.tab}, () => {
      this.dingList();
    });
  },
  // 定制商品
  dingList(complete) {
    let ding_post = {
      type: this.data.custom_active,
      perpage: 6
    };
    this.goodsList(ding_post, res => {
      this.setData({ding_list: res});
    }, complete);
  },
  // 爆款推荐
  baoList(complete) {
    let post = {
      type: 4,
      page: this.data.page
    };

    this.goodsList(post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            bao_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        this.setData({ bao_list: this.data.bao_list.concat(res) });
      }
      this.data.page++;
    }, complete);
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

      this.data.page = 1;
      this.data.bao_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

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
        this.baoList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 轮播跳页
  jump(e) {
    if (e.currentTarget.dataset.url) {
      app.jump(e);
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});