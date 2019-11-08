const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    role: 0,

    auth: false,
    full_loading: true,

    xuqiu_list: [],
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
      this.xuqiuList(() => {
        wx.hideNavigationBarLoading();
      });
    });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  xuqiuList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10
    };

    app.ajax('my/myXuqiuList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            xuqiu_list: [],
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
        app.avatar_format(res);
        app.ago_format(res, 'create_time');
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          // switch (res[i].role) {
          //   case 1:
          //     res[i].role_text = '博物馆';
          //     break;
          //   case 2:
          //     res[i].role_text = '设计师';
          //     break;
          //   case 3:
          //     res[i].role_text = '工厂';
          //     break;
          // }

          switch (res[i].pics.length) {
            case 1:
              res[i].img_class = 'one';
              break;
            case 2:
              res[i].img_class = 'two';
              break;
            default:
              res[i].img_class = 'three';
              break;
          }
          res[i].pics = res[i].pics.slice(0, 3);
        }
        this.setData({ xuqiu_list: this.data.xuqiu_list.concat(res) });
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

      this.data.page = 1;
      this.data.xuqiu_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.xuqiuList(() => {
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
        this.xuqiuList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 发布笔记后刷新列表，区别于下拉刷新（不需要loading等操作）
  refresh(callback) {
    this.data.page = 1;
    this.setData({
      nomore: false,
      nodata: false
    });
    this.data.xuqiu_list = [];
    this.xuqiuList(() => {
      if (callback) {
        callback();
      }
    });
  },
  // 分享
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
    app.page_open(() => {
      let need = e.currentTarget.dataset.need;
      if (need.status === 1) {
        wx.navigateTo({ url: '/pages/need-detail/need-detail?id=' + need.id });
      }
    });
  }
});