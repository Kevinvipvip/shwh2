var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    role: 0,  // 1.博物馆 2.设计师 3.工厂

    // full-loading
    full_loading: true,

    // textarea
    is_ios: false,

    // 列表相关
    page: 1,
    list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.data.role = app.user_data.role;

    // full-loading
    this.setData({ full_loading: false });

    // textarea
    this.setData({ is_ios: app.is_ios });

    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    WxParse.wxParse('rich_text', 'html', rich_text, this);

    // 跳转
    wx.switchTab({ url: '/pages/index/index' });
    wx.navigateTo({ url: '/pages/in-mp2/in-mp2?order_sn=' + res.order_sn });
    wx.redirectTo({ url: '/pages/in-mp2/in-mp2' });
    wx.navigateBack({ delta: 2 });

    // 设置标题
    wx.setNavigationBarTitle({ title: '这个是标题' });
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
            nodata: false,
            nomore: true
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
  },
  // 收集formid
  col_formid(e) {
    app.collectFormid(e.detail.formId);
  },
  // 跳页
  to_page() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.req.uid });
    });
  },
  // radio
  radio_handle(e) {
    console.log(e.detail.value);
  }
});