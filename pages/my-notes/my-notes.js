const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    auth: false,
    full_loading: true,
    active_tab: 1,  // 1.我的笔记 2.收藏笔记

    note_list: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false,

    c_note_list: [],
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
  // 获取我的笔记
  getMyNoteList(complete) {
    let post = {
      page: this.data.page,
      perPage: 10
    };

    app.ajax('my/getMyNoteList', post, res => {
      if (res.list.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            note_list: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        app.avatar_format(res.list);
        app.ago_format(res.list, 'create_time');
        for (let i = 0; i < res.list.length; i++) {
          app.format_img(res.list[i].pics);
          if ([1, 4].indexOf(res.list[i].pics.length) === -1) {
            res.list[i].flex_pad = app.null_arr(res.list[i].pics.length, 3);
          }
        }

        this.setData({ note_list: this.data.note_list.concat(res.list) });
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
      page: this.data.c_page,
      perPage: 10
    };

    app.ajax('my/getMyCollectedNoteList', post, (res) => {
      if (res.list.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            c_note_list: [],
            c_nodata: true,
            c_nomore: false
          });
        } else {
          this.setData({
            c_nodata: false,
            c_nomore: true
          })
        }
      } else {
        app.avatar_format(res.list);
        app.ago_format(res.list, 'create_time');
        for (let i = 0; i < res.list.length; i++) {
          app.format_img(res.list[i].pics);
          if ([1, 4].indexOf(res.list[i].pics.length) === -1) {
            res.list[i].flex_pad = app.null_arr(res.list[i].pics.length, 3);
          }
        }

        this.setData({ c_note_list: this.data.c_note_list.concat(res.list) });
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

        this.reset(1);
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

        this.reset(2);
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
    this.reset(1);
    this.getMyNoteList(() => {
      if (callback) {
        callback();
      }
    });
  },
  reset(type) {
    if (type === 1) {
      this.data.page = 1;
      this.data.note_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });
    } else {
      this.data.c_page = 1;
      this.data.c_note_list = [];
      this.setData({
        c_nomore: false,
        c_nodata: false
      });
    }
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
});