const app = getApp();

Page({
  data: {
    type: '1',
    full_loading: true,
    reqList: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad: function (options) {
    this.data.type = options.type;
    let nav_title = this.data.type === '1' ? '活动进行中' : '活动竞标中';
    wx.setNavigationBarTitle({ title: nav_title });

    this.getReqList(() => {
      this.setData({ full_loading: false });
    });
  },
  getReqList(complete) {
    let post = {
      token: app.user_data.token,
      type: this.data.type,
      page: this.data.page
    };

    app.ajax(app.my_config.api + 'api/getReqList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            reqList: [],
            nodata: true
          });
        } else {
          this.setData({ nomore: true });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          if (res[i].cover) {
            res[i].cover = app.my_config.base_url + '/' + res[i].cover;
          } else {
            res[i].cover = app.my_config.default_img;
          }
        }

        this.data.reqList = this.data.reqList.concat(res);
        this.setData({ reqList: this.data.reqList });
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
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.reqList = [];

    wx.showNavigationBarLoading();
    this.getReqList(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.getReqList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
})