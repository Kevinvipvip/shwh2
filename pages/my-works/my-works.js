const app = getApp();

Page({
  data: {
    id: 0,
    active_tab: 1,
    req_page: 1,
    req_workList: [],
    req_nodata: false,
    req_nomore: false,
    req_loading: false,
    show_page: 1,
    show_workList: [],
    show_nodata: false,
    show_nomore: false,
    show_loading: false
  },
  onLoad: function () {
    this.getMyReqWorks();
    this.getMyShowWorks();
  },
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 展示作品发布回调
  work_release_reload(callback) {
    this.setData({ active_tab: 2 });
    this.data.show_nomore = false;
    this.data.show_nodata = false;
    this.data.show_page = 1;
    this.data.show_workList = [];
    this.getMyShowWorks(() => {
      if (callback) {
        callback();
      }
    });
  },
  // 获取我的参赛作品
  getMyReqWorks(complete) {
    let post = {
      token: app.user_data.token
    };
    app.ajax(app.my_config.api + 'my/getMyReqWorks', post, (res) => {
      if (res.length === 0) {
        if (this.data.req_page === 1) {
          this.setData({ req_nodata: true });
        } else {
          this.setData({ req_nomore: true });
        }
      } else {
        app.format_img_arr(res, 'cover');
        this.setData({ req_workList: this.data.req_workList.concat(res) });
      }
      this.data.req_page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取我的展示作品
  getMyShowWorks(complete) {
    let post = {
      token: app.user_data.token
    };
    app.ajax(app.my_config.api + 'my/getMyShowWorks', post, (res) => {
      if (res.length === 0) {
        if (this.data.show_page === 1) {
          this.setData({ show_nodata: true });
        } else {
          this.setData({ show_nomore: true });
        }
      } else {
        app.format_img_arr(res, 'cover');
        this.setData({ show_workList: this.data.show_workList.concat(res) });
      }
      this.data.show_page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    if (this.data.active_tab === 1) {
      if (!this.data.req_loading) {
        this.data.req_loading = true;

        // 参赛作品
        this.data.req_nomore = false;
        this.data.req_nodata = false;
        this.data.req_page = 1;
        this.data.req_workList = [];

        wx.showNavigationBarLoading();
        this.getMyReqWorks(() => {
          this.data.req_loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    } else {
      if (!this.data.show_loading) {
        this.data.show_loading = true;

        // 展示作品
        this.data.show_nomore = false;
        this.data.show_nodata = false;
        this.data.show_page = 1;
        this.data.show_workList = [];

        wx.showNavigationBarLoading();
        this.getMyShowWorks(() => {
          this.data.show_loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    }
  }
})