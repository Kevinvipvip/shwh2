const app = getApp();

Page({
  data: {
    role: '1',
    full_loading: true,
    orgList: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad: function (options) {
    this.data.role = options.role;
    let nav_title = this.data.role === '1' ? '博物馆' : '文创机构';
    wx.setNavigationBarTitle({ title: nav_title });

    this.orgList(() => {
      this.setData({ full_loading: false });
    });
  },
  orgList(complete) {
    let post = {
      token: app.user_data.token,
      role: this.data.role,
      page: this.data.page
    };

    app.ajax('api/orgList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            orgList: [],
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

        this.data.orgList = this.data.orgList.concat(res);
        this.setData({ orgList: this.data.orgList });
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
      this.data.orgList = [];

      wx.showNavigationBarLoading();
      this.orgList(() => {
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
        this.orgList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
})