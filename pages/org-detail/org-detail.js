const app = getApp();

Page({
  data: {
    uid: 0,
    active_tab: 1,
    org: {},
    req_page: 1,
    req_workList: [],
    req_nodata: false,
    req_nomore: false,
    req_loading: false,
    show_page: 1,
    left_note_list: [],
    right_note_list: [],
    show_nodata: false,
    show_nomore: false,
    show_loading: false
  },
  onLoad: function (options) {
    this.data.uid = options.uid;

    this.orgDetail();
    this.orgReqList();
    this.userNoteList();
  },
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 博物馆文创机构详情
  orgDetail() {
    let post = {
      token: app.user_data.token,
      uid: this.data.uid
    };
    app.ajax(app.my_config.api + 'api/orgDetail', post, (res) => {
      app.format_img(res, 'cover');
      wx.setNavigationBarTitle({ title: res.name });
      this.setData({ org: res });
    });
  },
  // 博物馆文创机构需求列表
  orgReqList(complete) {
    let post = {
      token: app.user_data.token,
      uid: this.data.uid,
      page: this.data.req_page
    };
    app.ajax(app.my_config.api + 'api/orgReqList', post, (res) => {
      if (res.length === 0) {
        if (this.data.req_page === 1) {
          this.setData({ req_nodata: true });
        } else {
          this.setData({ req_nomore: true });
        }
      } else {
        app.format_img_arr(res, 'cover');
        this.setData({req_workList: this.data.req_workList.concat(res)});
      }
      this.data.req_page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 博物馆文创机构笔记列表
  userNoteList(complete) {
    let post = {
      token: app.user_data.token,
      uid: this.data.uid,
      page: this.data.show_page
    };
    app.ajax(app.my_config.api + 'api/userNoteList', post, (res) => {
      if (res.list.length === 0) {
        if (this.data.show_page === 1) {
          this.setData({ show_nodata: true });
        } else {
          this.setData({ show_nomore: true });
        }
      } else {
        app.format_img_arr(res.list, 'cover');
        for (let i = 0; i < res.list.length; i++) {
          if (res.list[i].pics[0]) {
            res.list[i].pics[0] = app.my_config.base_url + '/' + res.list[i].pics[0];
          } else {
            res.list[i].pics[0] = app.my_config.default_img;
          }

          if (i % 2 === 0) {
            this.data.left_note_list.push(res.list[i]);
          } else {
            this.data.right_note_list.push(res.list[i]);
          }
        }
        this.setData({
          left_note_list: this.data.left_note_list,
          right_note_list: this.data.right_note_list
        });
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
          this.orgReqList(() => {
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
          this.userNoteList(() => {
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
        this.orgReqList(() => {
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
        this.data.left_note_list = [];
        this.data.right_note_list = [];

        wx.showNavigationBarLoading();
        this.userNoteList(() => {
          this.data.show_loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    }
  }
})