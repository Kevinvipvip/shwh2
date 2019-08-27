const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    slideList: [],
    statusBarHeight: 0,
    topBarHeight: 0,
    full_loading: true,
    activeList: [],
    loading: false
  },
  onLoad() {
    app.mp_update();

    this.setData({
      statusBarHeight: app.my_config.statusBarHeight,
      topBarHeight: app.my_config.topBarHeight
    });

    this.slideList(() => {
      this.getActiveList(() => {
        this.setData({full_loading: false});
      });
    });
  },
  onShow() {
    // utils.select_tab_bar(this, 0);
  },
  slideList(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax(app.my_config.api + 'api/slideList', post, (res) => {
      for (let i = 0; i < res.length; i++) {
        if (res[i].pic) {
          res[i].pic = app.my_config.base_url + '/' + res[i].pic;
        } else {
          res[i].pic = app.my_config.default_img;
        }
      }
      this.setData({slideList: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  jump(e) {
    let page = e.currentTarget.dataset.page;
    if (page) {
      switch (page) {
        case 'pages/index/index':
        case 'pages/notes/notes':
        case 'pages/my/my':
          wx.switchTab({ url: '/' + page });
          break;
        default:
          wx.navigateTo({ url: '/' + page })
          break;
      }
    }
  },
  getActiveList(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax(app.my_config.api + 'api/getActiveList', post, (res) => {
      app.format_img_arr(res);
      app.format_img_arr(res, 'cover');
      for (let i = 0; i < res.length; i++) {
        res[i].month = /-(\d{1,2})-/.exec(res[i].start_time)[1];
      }
      
      this.setData({activeList: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.slideList = [];
      this.data.activeList = [];

      wx.showNavigationBarLoading();
      this.slideList(() => {
        this.getActiveList(() => {
          this.data.loading = false;
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        });
      });
    }
  }
})