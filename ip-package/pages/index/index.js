const app = getApp();

Page({
  data: {
    full_loading: true,

    search: '',

    slide_list: [],  // 轮播图
    ip_cate_list: [],  // 版权分类

    page_cate: 0,  // 外面进来的cateid
    active_tab: -1,

    page: 1,
    ip_list: [],  // 版权列表
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad(options) {
    if (options.cate) {
      this.data.page_cate = parseInt(options.cate);
    }

    this.init(() => {
      if (this.data.page_cate) {
        for (let i = 0; i < this.data.ip_cate_list.length; i++) {
          if (this.data.ip_cate_list[i].id === this.data.page_cate) {
            this.setData({ active_tab: i }, () => {
              this.reset();
              this.ipList();
            });
            break;
          }
        }
      }

      this.setData({ full_loading: false });
    });
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  init(complete) {
    // 爆款商品
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    let promise2 = new Promise(resolve => {
      this.ipCateList(() => {
        resolve();
      });
    });

    let promise3 = new Promise(resolve => {
      this.ipList(() => {
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
    app.ajax('copyright/slideList', null, res => {
      app.format_img(res);
      this.setData({ slide_list: res });
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
  // 版权分类
  ipCateList(complete) {
    app.ajax('copyright/ipCateList', null, res => {
      app.format_img(res, 'icon');
      this.setData({ ip_cate_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  searchIp() {
    this.reset();
    this.ipList();
  },
  // 版权分类改变
  tab_change(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({ active_tab: index }, () => {
      this.reset();
      this.ipList();
    });
  },
  // 版权列表
  ipList(complete) {
    let post = {
      search: this.data.search.trim(),
      page: this.data.page
    };

    if (this.data.active_tab !== -1) {
      post.cate_id = this.data.ip_cate_list[this.data.active_tab].id;
    }

    app.ajax('copyright/ipList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            ip_list: [],
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
        app.format_img(res, 'cover');
        this.setData({ ip_list: this.data.ip_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.ip_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

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
        this.ipList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});