const app = getApp();

Page({
  data: {
    page: 1,
    biddingList: [],
    loading: 0,
    nodata: false,
    nomore: false
  },
  onLoad() {
    this.myBiddingList();
  },
  myBiddingList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10
    };

    app.ajax('my/myBiddingList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            biddingList: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nomore: true,
            nodata: false
          });
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          res[i].choose_text = res[i].choose === 1 ? '选中' : '未选中';
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
      this.data.page = 1;
      this.data.biddingList = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.myBiddingList(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
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
});