const app = getApp();

Page({
  data: {
    full_loading: true,
    factoryList: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad: function () {
    this.factoryList(() => {
      this.setData({ full_loading: false });
    });
  },
  factoryList(complete) {
    let post = {
      token: app.user_data.token,
      role: this.data.role,
      page: this.data.page
    };

    app.ajax(app.my_config.api + 'api/factoryList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            factoryList: [],
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

        this.data.factoryList = this.data.factoryList.concat(res);
        this.setData({ factoryList: this.data.factoryList });
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

      this.data.nomore = false;
      this.data.nodata = false;
      this.data.page = 1;
      this.data.factoryList = [];

      wx.showNavigationBarLoading();
      this.factoryList(() => {
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
        this.factoryList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
})