const app = getApp();

Page({
  data: {
    my_uid: 0,
    id: 0,
    active_tab: 1,
    designer: {},
    focus_loading: false,

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
  onLoad: function (options) {
    this.data.id = options.id;
    this.setData({ my_uid: app.user_data.uid });

    this.designerDetail();
    this.designerReqWorkList();
    this.designerShowWorkList();
  },
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 设计师详情
  designerDetail() {
    let post = {
      token: app.user_data.token,
      uid: this.data.id
    };
    app.ajax(app.my_config.api + 'api/designerDetail', post, (res) => {
      wx.setNavigationBarTitle({ title: res.nickname });

      app.avatar_format(res);
      this.setData({ designer: res });
    });
  },
  // 关注/取消关注
  iFocus() {
    if (!this.data.focus_loading) {
      this.data.focus_loading = true;

      let post = {
        token: app.user_data.token,
        to_uid: this.data.designer.id
      };

      app.ajax(app.my_config.api + 'note/iFocus', post, (res) => {
        this.setData({ ['designer.if_focus']: res });
      }, null, () => {
        this.data.focus_loading = false;
      });
    }
  },
  // 获取设计师页参赛作品
  designerReqWorkList(complete) {
    let post = {
      token: app.user_data.token,
      uid: this.data.id,
      page: this.data.req_page
    };
    app.ajax(app.my_config.api + 'api/designerReqWorkList', post, (res) => {
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
  // 获取设计师页展示作品
  designerShowWorkList(complete) {
    let post = {
      token: app.user_data.token,
      uid: this.data.id,
      page: this.data.show_page
    };
    app.ajax(app.my_config.api + 'api/designerShowWorkList', post, (res) => {
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
  onReachBottom: function () {
    if (this.data.active_tab === 1) {
      // 参赛作品
      if (!this.data.req_nodata && !this.data.req_nomore) {
        if (!this.data.req_loading) {
          this.data.req_loading = true;
          wx.showNavigationBarLoading();
          this.designerReqWorkList(() => {
            wx.hideNavigationBarLoading();
            this.data.req_loading = false;
          });
        }
      }
    } else {
      // 展示作品
      if (!this.data.show_nomore && !this.data.show_nodata) {
        if (!this.data.show_loading) {
          this.data.show_loading = true;
          wx.showNavigationBarLoading();
          this.designerShowWorkList(() => {
            wx.hideNavigationBarLoading();
            this.data.show_loading = false;
          });
        }
      }
    }
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
        this.designerReqWorkList(() => {
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
        this.designerShowWorkList(() => {
          this.data.show_loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    }
  }
})