const app = getApp();

Page({
  data: {
    page: 1,
    funding_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.fundingList();
  },
  // 众筹列表
  fundingList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10,
      order: 2  // 按投票
    };

    app.ajax('api/fundingList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            funding_list: [],
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
        app.format_img(res, 'cover');
        app.qian_format(res, 'curr_money');
        app.qian_format(res, 'need_money');

        this.setData({ funding_list: this.data.funding_list.concat(res) });
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
      this.data.funding_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.fundingList(() => {
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
        this.fundingList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});