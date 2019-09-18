var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    // textarea
    is_ios: false,

    // 列表相关
    page: 1,
    list: [],
    nomore: false,
    nodata: true,
    loading: false
  },
  onLoad() {
    // textarea
    this.setData({is_ios: app.is_ios});

    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    WxParse.wxParse('rich_text', 'html', rich_text, this);
  },
  // 获取列表
  get_list(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('get_list', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nomore: true,
            nodata: false
          })
        }
      } else {
        this.setData({ list: this.data.list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.get_list(() => {
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
        this.get_list(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  bind_input(e) {
    app.bind_input(e, this);
  }
});