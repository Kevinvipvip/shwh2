const app = getApp();

Page({
  data: {
    full_loading: true,

    slide_list: [],  // 轮播图

    page: 1,
    funding_list: [],
    filter_status: 0,
    status_list: [
      {
        status: null,
        text: '全部'
      },
      {
        status: 0,
        text: '预热'
      },
      {
        status: 1,
        text: '众筹中'
      },
      {
        status: 2,
        text: '已结束'
      }
    ],
    nomore: false,
    nodata: false,
    loading: false,

    bind_tel_show: false
  },
  onLoad() {
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 轮播图
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    let promise2 = new Promise(resolve => {
      this.fundingList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1. promise2
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 轮播图
  slideList(complete) {
    app.ajax('funding/slideList', null, res => {
      app.format_img(res);
      this.setData({slide_list: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 筛选状态改变
  status_change(e) {
    this.setData({ filter_status: parseInt(e.detail.value)}, () => {
      this.reset();
      this.fundingList();
    })
  },
  // 众筹列表
  fundingList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10
    };

    if (this.data.filter_status !== 0) {
      post.status = this.data.status_list[this.data.filter_status].status
    }

    app.ajax('funding/fundingList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            funding_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nomore: true,
            nodata: false
          })
        }
      } else {
        app.format_img(res, 'cover');
        app.qian_format(res, 'curr_money');
        app.qian_format(res, 'need_money');

        this.setData({ funding_list: this.data.funding_list.concat(res) });
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

      this.reset();

      wx.showNavigationBarLoading();
      this.fundingList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  reset() {
    this.data.page = 1;
    this.data.funding_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.fundingList(() => {
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
  // 去发起众筹页
  chou_start() {
    if (!app.user_data.uid) {
      this.setData({bind_tel_show: true});
    } else {
      wx.navigateTo({url: '/chou-package/pages/chou-start/chou-start'});
    }
  }
});