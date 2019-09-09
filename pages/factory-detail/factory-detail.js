const app = getApp();

Page({
  data: {
    uid: 0,
    active_tab: 1,
    factory: {},
    bidding_page: 1,
    biddingList: [],
    bidding_nodata: false,
    bidding_nomore: false,
    bidding_loading: false,
    show_page: 1,
    left_note_list: [],
    right_note_list: [],
    show_nodata: false,
    show_nomore: false,
    show_loading: false
  },
  onLoad: function (options) {
    this.data.uid = options.uid;

    this.factoryDetail();
    this.factoryBiddingList();
    this.userNoteList();
  },
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 博物馆文创机构详情
  factoryDetail() {
    let post = {
      token: app.user_data.token,
      uid: this.data.uid
    };
    app.ajax('api/factoryDetail', post, (res) => {
      app.format_img(res, 'cover');
      wx.setNavigationBarTitle({ title: res.org });
      this.setData({ factory: res });
    });
  },
  // 博物馆文创机构需求列表
  factoryBiddingList(complete) {
    let post = {
      token: app.user_data.token,
      uid: this.data.uid,
      page: this.data.bidding_page
    };
    app.ajax('api/factoryBiddingList', post, (res) => {
      if (res.length === 0) {
        if (this.data.bidding_page === 1) {
          this.setData({ bidding_nodata: true });
        } else {
          this.setData({ bidding_nomore: true });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].pics.length; j++) {
            if (res[i].pics[j]) {
              res[i].pics[j] = app.my_config.base_url + '/' + res[i].pics[j];
            } else {
              res[i].pics[j] = app.my_config.default_img;
            }
          }
        }
        this.setData({biddingList: this.data.biddingList.concat(res)});
      }
      this.data.bidding_page++;
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
    app.ajax('api/userNoteList', post, (res) => {
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

          app.avatar_format(res.list[i]);
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
      if (!this.data.bidding_nodata && !this.data.bidding_nomore) {
        if (!this.data.bidding_loading) {
          this.data.bidding_loading = true;
          wx.showNavigationBarLoading();
          this.orgReqList(() => {
            wx.hideNavigationBarLoading();
            this.data.bidding_loading = false;
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
      if (!this.data.bidding_loading) {
        this.data.bidding_loading = true;

        // 参赛作品
        this.data.bidding_nomore = false;
        this.data.bidding_nodata = false;
        this.data.bidding_page = 1;
        this.data.biddingList = [];

        wx.showNavigationBarLoading();
        this.factoryBiddingList(() => {
          this.data.bidding_loading = false;
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