const app = getApp();

Page({
  data: {
    page: 1,
    biddingList: [],
    loading: 0,
    nodata: false,
    nomore: false
  },
  onLoad: function () {
    this.myBiddingList();
  },
  myBiddingList(complete) {
    let post = {
      token: app.user_data.token,
      page: this.data.page
    };

    app.ajax(app.my_config.api + 'my/myBiddingList', post, (res) => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            biddingList: [],
            nodata: true
          });
        } else {
          this.setData({ nomore: true });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].pics.length; j++) {
            if (res[i].pics[j]) {
              res[i].pics[j] = app.my_config.base_url + '/' + res[i].pics[j];
            } else {
              res[i].pics[j] = app.my_config.default_img;
            }
          }
        }
        this.setData({ biddingList: this.data.biddingList.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      // 参赛作品
      this.data.nomore = false;
      this.data.nodata = false;
      this.data.page = 1;
      this.data.biddingList = [];

      wx.showNavigationBarLoading();
      this.myBiddingList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  onReachBottom: function () {
    if (!this.data.nodata && !this.data.nomore) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.myBiddingList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 跳转投票详情或竞标详情
  jump(e) {
    wx.navigateTo({ url: '/pages/bidding-detail/bidding-detail?id=' + e.currentTarget.dataset.id });
  }
})