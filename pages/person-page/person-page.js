const app = getApp();

Page({
  data: {
    full_loading: true,

    active_index: 0,  // 0.店铺商品 1.所有笔记 2.个人简介

    uid: 0,
    user: {},  // 用户详情
    focus_loading: false,

    // 商品列表
    goods_list: [],
    goods_page: 1,
    goods_nomore: false,
    goods_nodata: false,
    goods_loading: false,

    // 笔记列表
    note_list: [],
    note_page: 1,
    note_nomore: false,
    note_nodata: false,
    note_loading: false,

    my_uid: 0,  // 我的uid

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad(options) {
    this.data.uid = options.uid;
    this.setData({ my_uid: app.user_data.uid });

    // 页面初始化
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 用户详情
    let promise1 = new Promise(resolve => {
      this.detail(() => {
        resolve();
      });
    });

    // 商品列表
    let promise2 = new Promise(resolve => {
      this.goodsList(() => {
        resolve();
      });
    });

    // 笔记列表
    let promise3 = new Promise(resolve => {
      this.noteList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 切换tab
  tab_change(e) {
    this.setData({ active_index: parseInt(e.currentTarget.dataset.tab) });
  },
  // 用户详情
  detail(complete) {
    app.ajax('person/detail', { uid: this.data.uid }, res => {
      app.format_img(res.pics);
      app.avatar_format(res);

      this.setData({
        user: res,
        active_index: res.role ? 0 : 1
      });
    }, null, complete);
  },
  // 商品列表
  goodsList(complete) {
    let post = {
      uid: this.data.uid,
      page: this.data.goods_page
    };

    app.ajax('person/goodsList', post, res => {
      if (res.length === 0) {
        if (this.data.goods_page === 1) {
          this.setData({
            goods_list: [],
            goods_nodata: true,
            goods_nomore: false
          });
        } else {
          this.setData({
            goods_nodata: false,
            goods_nomore: true
          });
        }
      } else {
        app.format_img(res, 'poster');
        this.setData({ goods_list: this.data.goods_list.concat(res) });
      }
      this.data.goods_page++;
    }, null, complete);
  },
  // 笔记列表
  noteList(complete) {
    let post = {
      uid: this.data.uid,
      page: this.data.note_page
    };

    app.ajax('person/noteList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            note_list: [],
            note_nodata: true,
            note_nomore: false
          });
        } else {
          this.setData({
            note_nodata: false,
            note_nomore: true
          })
        }
      } else {
        app.avatar_format(res);
        app.ago_format(res, 'create_time');
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          if ([1, 4].indexOf(res[i].pics.length) === -1) {
            res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
          }
        }

        this.setData({ note_list: this.data.note_list.concat(res) });
      }
      this.data.note_page++;
    }, null, complete);
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.goods_loading && !this.data.note_loading) {
      this.data.goods_loading = true;
      this.data.note_loading = true;

      wx.showNavigationBarLoading();

      this.reset(1);
      this.reset(2);
      this.init(() => {
        this.data.goods_loading = false;
        this.data.note_loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (this.data.active_index === 0) {
      if (!this.data.goods_nomore && !this.data.goods_nodata) {
        if (!this.data.goods_loading) {
          this.data.goods_loading = true;
          wx.showNavigationBarLoading();
          this.goodsList(() => {
            wx.hideNavigationBarLoading();
            this.data.goods_loading = false;
          });
        }
      }
    } else {
      if (!this.data.note_nomore && !this.data.note_nodata) {
        if (!this.data.note_loading) {
          this.data.note_loading = true;
          wx.showNavigationBarLoading();
          this.noteList(() => {
            wx.hideNavigationBarLoading();
            this.data.note_loading = false;
          });
        }
      }
    }
  },
  reset(type) {
    if (type === 1) {
      this.data.goods_page = 1;
      this.data.goods_list = [];
      this.setData({
        goods_nomore: false,
        goods_nodata: false
      });
    } else {
      this.data.note_page = 1;
      this.data.note_list = [];
      this.setData({
        note_nomore: false,
        note_nodata: false
      });
    }
  },
  // 关注/取消关注
  iFocus() {
    app.check_bind(() => {
      if (!this.data.focus_loading) {
        this.data.focus_loading = true;

        app.ajax('note/iFocus', { to_uid: this.data.uid }, res => {
          this.setData({ ['user.ifocus']: res });
        }, null, () => {
          this.data.focus_loading = false;
        });
      }
    });
  },
   // 分享
   onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});