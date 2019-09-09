const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    auth: false,
    full_loading: true,

    left_height: 0,
    right_height: 0,
    left_note_list: [],
    right_note_list: [],
    search: '',
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    app.get_auth((res) => {
      this.setData({
        auth: Boolean(res),
        full_loading: false
      });
      wx.showNavigationBarLoading();
      this.getNoteList(() => {
        wx.hideNavigationBarLoading();
      });
    });
  },
  onShow() {
    // utils.select_tab_bar(this, 1);
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  search_notes() {
    this.data.left_height = 0;
    this.data.right_height = 0;
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.left_note_list = [];
    this.data.right_note_list = [];

    this.getNoteList();
  },
  getNoteList(complete) {
    let post = {
      token: app.user_data.token,
      search: this.data.search.trim(),
      page: this.data.page,
      perPage: 30
    };

    app.ajax('note/getNoteList', post, (res) => {
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
          if (res.list[i].pics[0]) {
            res.list[i].pics[0] = app.my_config.base_url + '/' + res.list[i].pics[0];
          } else {
            res.list[i].pics[0] = app.my_config.default_img;
          }

          res.list[i].avatar = res.list[i].avatar.indexOf('https') === 0 ? res.list[i].avatar : app.my_config.base_url + '/' + res.list[i].avatar;

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
  // 下拉刷新
  onPullDownRefresh() {
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
      this.getNoteList(() => {
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
        this.getNoteList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 发布笔记后刷新列表，区别于下拉刷新（不需要loading等操作）
  refresh() {
    this.data.left_height = 0;
    this.data.right_height = 0;
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.left_note_list = [];
    this.data.right_note_list = [];
    this.getNoteList();
  },
  onShareAppMessage(e) {
    wx.showShareMenu({
      withShareTicket: true,
      success: function () {
      }
    });

    return { path: app.share_path() };
  },
  iLike(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      let index = e.currentTarget.dataset.index;
      let type = e.currentTarget.dataset.type;

      let post = {
        note_id: type === '1' ? this.data.left_note_list[index].id : this.data.right_note_list[index].id,
        token: app.user_data.token
      };

      let note_str;
      let note;
      if (type === '1') {
        note_str = 'left_note_list[' + index + '].';
        note = this.data.left_note_list[index];
      } else {
        note_str = 'right_note_list[' + index + '].';
        note = this.data.right_note_list[index];
      }

      app.ajax('note/iLike', post, (res) => {
        this.setData({
          [note_str + 'like']: note.like + (res ? 1 : -1),
          [note_str + 'ilike']: res
        });
      }, null, () => {
        this.data.loading = false;
      });
    }
  }
})