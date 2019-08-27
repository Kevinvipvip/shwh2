const app = getApp()

Page({
  data: {
    release_show: false,

    full_loading: true,
    reqList: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad: function () {
    this.setData({release_show: [1, 2].indexOf(app.user_data.role) !== -1});

    this.myReqList(() => {
      this.setData({ full_loading: false });
    });
  },
  myReqList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page
    };

    app.ajax(app.my_config.api + 'my/myReqList', post, (res) => {
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
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.nomore = false;
      this.data.nodata = false;
      this.data.page = 1;
      this.data.reqList = [];

      wx.showNavigationBarLoading();
      this.myReqList(() => {
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
        this.myReqList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 跳转编辑
  to_edit(e) {
    wx.navigateTo({ url: '/pages/req-edit/req-edit?id=' + e.currentTarget.dataset.id });
  },
  // 跳转详情
  to_detail(e) {
    let req = e.currentTarget.dataset.req;
    if (req.status == 1) {
      wx.navigateTo({ url: '/pages/req-detail/req-detail?id=' + req.id });
    }
  },
  // 编辑成功回调
  refresh(callback) {
    this.data.nomore = false;
    this.data.nodata = false;
    this.data.page = 1;
    this.data.reqList = [];
    this.myReqList(() => {
      callback();
    });
  }
})