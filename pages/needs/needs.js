const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    role: 0,

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
    loading: false,

    note_list: []
  },
  onLoad() {
    app.get_auth((res) => {
      this.setData({
        auth: Boolean(res),
        full_loading: false,
        role: app.user_data.role
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
    this.data.page = 1;
    this.data.left_note_list = [];
    this.data.right_note_list = [];

    this.setData({
      nomore: false,
      nodata: false
    });

    this.getNoteList();
  },
  getNoteList(complete) {
    let post = {
      token: app.user_data.token,
      search: this.data.search.trim(),
      page: this.data.page,
      perpage: 10
    };

    app.ajax('xuqiu/xuqiuList', post, (res) => {
      if (res.length === 0) {
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
        app.avatar_format(res);

        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);

          // 测试用
          // console.log(res[i].id, res[i].pics[0], res[i].width, res[i].height);

          if (this.data.left_height <= this.data.right_height) {
            this.data.left_note_list.push(res[i]);
            this.data.left_height += res[i].height / res[i].width;
          } else {
            this.data.right_note_list.push(res[i]);
            this.data.right_height += res[i].height / res[i].width;
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
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});