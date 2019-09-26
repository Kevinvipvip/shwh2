const app = getApp();

Page({
  data: {
    nomore: false,
    nodata: false,
    page: 1,
    score_log: [],
    loading: false
  },
  onLoad() {
    this.myScoreLog();
  },
  myScoreLog(complete) {
    let post = {
      page: this.data.page,
      perpage: 20
    };

    app.ajax('my/myScoreLog', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            score_log: [],
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
        this.setData({ score_log: this.data.score_log.concat(res) });
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
      this.data.score_log = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.myScoreLog(() => {
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
        this.myScoreLog(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});