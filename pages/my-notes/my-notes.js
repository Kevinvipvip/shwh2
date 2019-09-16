const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    auth: false,
    full_loading: true,
    active_tab: 1,

    left_height: 0,
    right_height: 0,
    left_note_list: [],
    right_note_list: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false,

    c_left_height: 0,
    c_right_height: 0,
    c_left_note_list: [],
    c_right_note_list: [],
    c_page: 1,
    c_nomore: false,
    c_nodata: false,
    c_loading: false
  },
  onLoad() {
    app.get_auth((res) => {
      this.setData({
        auth: Boolean(res),
        full_loading: false
      });
      wx.showNavigationBarLoading();
      this.getMyNoteList(() => {
        this.getMyCollectedNoteList(() => {
          wx.hideNavigationBarLoading();
        });
      });
    });
  },
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  onShow() {
    utils.select_tab_bar(this, 1);
  },
  // 获取我的笔记
  getMyNoteList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page,
      perPage: 10
    };

    app.ajax('my/getMyNoteList', post, (res) => {
      if (res.list.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            left_note_list: [],
            right_note_list: [],
            nodata: true
          });
        } else {
          this.setData({ nomore: true });
        }
      } else {
        for (let i = 0; i < res.list.length; i++) {
          app.format_img(res.list[i].pics);
          if (this.data.left_height <= this.data.right_height) {
            this.data.left_note_list.push(res.list[i]);
            this.data.left_height += res.list[i].height / res.list[i].width;
          } else {
            this.data.right_note_list.push(res.list[i]);
            this.data.right_height += res.list[i].height / res.list[i].width;
          }
        }

        this.setData({
          left_note_list: this.data.left_note_list,
          right_note_list: this.data.right_note_list
        });
      }

      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 我收藏的笔记
  getMyCollectedNoteList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.c_page,
      perPage: 10
    };

    app.ajax('my/getMyCollectedNoteList', post, (res) => {
      if (res.list.length === 0) {
        if (this.data.c_page === 1) {
          this.setData({ c_nodata: true });
        } else {
          this.setData({ c_nomore: true });
        }
      } else {
        for (let i = 0; i < res.list.length; i++) {
          app.format_img(res.list[i].pics);
          res.list[i].avatar = res.list[i].avatar.indexOf('https') === 0 ? res.list[i].avatar : app.my_config.base_url + '/' + res.list[i].avatar;

          if (this.data.c_left_height <= this.data.c_right_height) {
            this.data.c_left_note_list.push(res.list[i]);
            this.data.c_left_height += res.list[i].height / res.list[i].width;
          } else {
            this.data.c_right_note_list.push(res.list[i]);
            this.data.c_right_height += res.list[i].height / res.list[i].width;
          }

          app.avatar_format(res.list[i]);
        }

        this.setData({
          c_left_note_list: this.data.c_left_note_list,
          c_right_note_list: this.data.c_right_note_list
        });
      }

      this.data.c_page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.active_tab === 1) {
      if (!this.data.loading) {
        this.data.loading = true;

        this.data.left_height = 0;
        this.data.right_height = 0;
        this.data.nomore = false;
        this.data.nodata = false;
        this.data.page = 1;
        this.data.left_note_list = [];
        this.data.right_note_list = [];

        wx.showNavigationBarLoading();
        this.getMyNoteList(() => {
          this.data.loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    } else {
      if (!this.data.c_loading) {
        this.data.c_loading = true;

        this.data.c_left_height = 0;
        this.data.c_right_height = 0;
        this.data.c_nomore = false;
        this.data.c_nodata = false;
        this.data.c_page = 1;
        this.data.c_left_note_list = [];
        this.data.c_right_note_list = [];

        wx.showNavigationBarLoading();
        this.getMyCollectedNoteList(() => {
          this.data.c_loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      }
    }
  },
  // 上拉加载
  onReachBottom() {
    if (this.data.active_tab === 1) {
      if (!this.data.nomore && !this.data.nodata) {
        if (!this.data.loading) {
          this.data.loading = true;
          wx.showNavigationBarLoading();
          this.getMyNoteList(() => {
            wx.hideNavigationBarLoading();
            this.data.loading = false;
          });
        }
      }
    } else {
      if (!this.data.c_nomore && !this.data.c_nodata) {
        if (!this.data.c_loading) {
          this.data.c_loading = true;
          wx.showNavigationBarLoading();
          this.getMyCollectedNoteList(() => {
            wx.hideNavigationBarLoading();
            this.data.c_loading = false;
          });
        }
      }
    }
  },
  // 发布笔记后刷新列表，区别于下拉刷新（不需要loading等操作）
  refresh(callback) {
    this.data.left_height = 0;
    this.data.right_height = 0;
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.left_note_list = [];
    this.data.right_note_list = [];
    this.getMyNoteList(() => {
      if (callback) {
        callback();
      }
    });
  },
  onShareAppMessage(e) {
    wx.showShareMenu({
      withShareTicket: true,
      success: function () {
      }
    });
  },
  // 跳转编辑
  to_edit(e) {
    wx.navigateTo({ url: '/pages/note-publish/note-publish?id=' + e.currentTarget.dataset.id });
  },
  // 跳转详情
  to_detail(e) {
    let note = e.currentTarget.dataset.note;
    if (note.status == 1) {
      wx.navigateTo({ url: '/pages/note-detail/note-detail?id=' + note.id });
    }
  }
})