const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    role: 0,

    auth: false,
    full_loading: true,

    type: 0,  // 0.全部 1.文旅机构 2.工厂

    note_list: [],
    search: '',
    page: 1,
    nomore: false,
    nodata: false,
    loading: false,

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad() {
    this.getNoteList(() => {
      this.setData({ full_loading: false });
    });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  search_notes() {
    this.reset();
    this.getNoteList();
  },
  type_change(e) {
    this.setData({type: e.currentTarget.dataset.type}, () => {
      this.reset();
      this.getNoteList();
    });
  },
  getNoteList(complete) {
    let post = {
      search: this.data.search.trim(),
      type: this.data.type,
      page: this.data.page
    };

    app.ajax('note/getNoteList', post, (res) => {
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
  reset() {
    this.data.page = 1;
    this.data.note_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.reset();

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
    this.reset();
    this.getNoteList();
  },
  onShareAppMessage() {
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
  },
  // 绑定手机号弹窗
  go_publish() {
    if (!app.user_data.uid) {
      this.setData({bind_tel_show: true});
    } else {
      wx.navigateTo({url: '/pages/note-publish/note-publish'});
    }
  }
});