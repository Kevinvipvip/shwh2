const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图
    hot_list: [],  // 热门赛事

    status: -1,  // -1.全部 0.未开始 1.进行中 2.已结束
    page: 1,
    ac_list: [],  // 下方赛事列表
    nomore: true,
    nodata: false,
    loading: false,

    bind_tel_show: false
  },
  onLoad() {
    this.init(() => {
      this.setData({ full_loading: false });
    });

    // this.getAllReqList();
  },
  init(complete) {
    // 轮播
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    // 热门赛事
    let promise2 = new Promise(resolve => {
      this.hotList(() => {
        resolve();
      });
    });

    // 活动列表（下方）
    let promise3 = new Promise(resolve => {
      this.ac_list(() => {
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
    app.ajax('activity/slideList', null, res => {
      app.format_img(res);
      this.setData({slide_list: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 轮播跳页
  jump(e) {
    if (e.currentTarget.dataset.url) {
      app.jump(e);
    }
  },
  // 活动列表
  activityList(post, success, complete) {
    app.ajax('activity/activityList', post, res => {
      app.format_img(res, 'cover');
      app.format_time(res, 'start_time', 'yyyy-MM-dd');
      app.format_time(res, 'end_time', 'yyyy-MM-dd');
      success(res);
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 热门赛事
  hotList(complete) {
    this.activityList({recommend: 1}, res => {
      this.setData({hot_list: res});
    }, () => {
      complete();
    });
  },
  // tab改变
  tab_change(e) {
    this.setData({status: e.currentTarget.dataset.status}, () => {
      this.reset();
      this.ac_list();
    });
  },
  // 活动列表（下方）
  ac_list(complete) {
    let post = {
      page: this.data.page
    };

    if (this.data.status !== -1) {
      post.status = this.data.status;
    }

    this.activityList(post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            ac_list: [],
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
        this.setData({ ac_list: this.data.ac_list.concat(res) });
      }
      this.data.page++;
    }, () => {
      complete();
    })
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
        this.ac_list(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  reset() {
    this.data.page = 1;
    this.data.activity_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 去发布文创赛事页
  to_publish() {
    if (!app.user_data.uid) {
      this.setData({bind_tel_show: true});
    } else {
      wx.navigateTo({url: '../activity-publish/activity-publish'});
    }
  }
});