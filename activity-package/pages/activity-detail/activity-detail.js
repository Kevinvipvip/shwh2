const app = getApp();

Page({
  data: {
    full_loading: false,

    id: 0,
    activity: {},

    search: '',
    page: 1,
    works_list: [],
    nomore: false,
    nodata: false,
    loading: false,

    bind_tel_show: false
  },
  onLoad(options) {
    this.setData({ id: options.id });

    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 活动详情
    let promise1 = new Promise(resolve => {
      this.activityDetail(() => {
        resolve();
      });
    });

    // 活动详情
    let promise2 = new Promise(resolve => {
      this.worksList(() => {
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
  // 活动详情
  activityDetail(complete) {
    app.ajax('activity/activityDetail', { activity_id: this.data.id }, res => {
      app.avatar_format(res);

      app.format_img(res, 'cover');
      app.format_img(res, 'poster');
      app.format_img(res, 'video_url');

      app.format_time(res, 'start_time', 'yyyy-MM-dd');
      app.format_time(res, 'deadline', 'yyyy-MM-dd');
      app.format_time(res, 'end_time', 'yyyy-MM-dd');

      this.setData({ activity: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 搜索作品
  search_works() {
    this.reset();
    this.worksList();
  },
  // 清除搜索框
  clear_search() {
    this.setData({ search: '' }, () => {
      this.reset();
      this.worksList();
    });
  },
  // 作品列表
  worksList(complete) {
    let post = {
      page: this.data.page,
      search: this.data.search,
      activity_id: this.data.id
    };

    app.ajax('activity/worksList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            works_list: [],
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
        app.avatar_format(res);
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
        }

        this.setData({ works_list: this.data.works_list.concat(res) });
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
        this.worksList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.works_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 作品投票
  worksVote(e) {
    if (!this.data.loading) {
      let index = e.currentTarget.dataset.index;
      let work = this.data.works_list[index];

      wx.showModal({
        title: '提示',
        content: '确定投票？',
        success: res => {
          if (res.confirm) {
            this.data.loading = true;
            app.ajax('activity/worksVote', { work_id: work.id }, res => {
              if (res) {
                work.vote++;
                this.setData({ [`works_list[${index}]`]: work });
              }
            }, null, () => {
              this.data.loading = false;
            });
          }
        }
      });
    }
  },
  // 去作品投稿页
  to_up_work() {
    if (!app.user_data.uid) {
      this.setData({ bind_tel_show: true });
    } else {
      wx.navigateTo({ url: '/pages/work-release/work-release?activity_id=' + this.data.id });
    }
  }
});