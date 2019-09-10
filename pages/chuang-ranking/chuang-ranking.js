const app = getApp();

Page({
  data: {
    page: 1,
    idea_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.ideaList();
  },
  // 创意排行
  ideaList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10,
      order: 2  // 按投票
    };

    app.ajax('api/ideaList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            idea_list: [],
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
        app.avatar_format(res, 'avatar');
        this.setData({ idea_list: this.data.idea_list.concat(res) });
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
      this.data.idea_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.ideaList(() => {
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
        this.ideaList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});