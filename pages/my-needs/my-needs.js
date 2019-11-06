const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    auth: false,
    full_loading: true,

    left_height: 0,
    right_height: 0,
    left_need_list: [],
    right_need_list: [],
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
      this.myXuqiuList(() => {
        wx.hideNavigationBarLoading();
      });
    });
  },
  // 获取我的需求
  myXuqiuList(complete) {
    let post = {
      page: this.data.page,
      perPage: 10
    };

    app.ajax('my/myXuqiuList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            left_need_list: [],
            right_need_list: [],
            nodata: true
          });
        } else {
          this.setData({ nomore: true });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          if (this.data.left_height <= this.data.right_height) {
            this.data.left_need_list.push(res[i]);
            this.data.left_height += res[i].height / res[i].width;
          } else {
            this.data.right_need_list.push(res[i]);
            this.data.right_height += res[i].height / res[i].width;
          }
        }

        this.setData({
          left_need_list: this.data.left_need_list,
          right_need_list: this.data.right_need_list
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
      this.data.page = 1;
      this.data.left_need_list = [];
      this.data.right_need_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.myXuqiuList(() => {
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
        this.myXuqiuList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 发布笔记后刷新列表，区别于下拉刷新（不需要loading等操作）
  refresh(callback) {
    this.data.left_height = 0;
    this.data.right_height = 0;
    this.data.page = 1;
    this.data.left_need_list = [];
    this.data.right_need_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });

    this.myXuqiuList(() => {
      if (callback) {
        callback();
      }
    });
  },
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  // 跳转编辑
  to_edit(e) {
    wx.navigateTo({ url: '/pages/need-publish/need-publish?id=' + e.currentTarget.dataset.id });
  },
  // 跳转详情
  to_detail(e) {
    let need = e.currentTarget.dataset.need;
    if (need.status === 1) {
      wx.navigateTo({ url: '/pages/need-detail/need-detail?id=' + need.id });
    }
  }
});