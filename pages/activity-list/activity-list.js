const app = getApp();

Page({
  data: {
    page: 1,
    req_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.getReqList();
  },
  // 需求列表（投石）
  getReqList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10
    };

    app.ajax('api/getReqList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            req_list: [],
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
        app.time_format(res, 'start_time');
        app.time_format(res, 'end_time');

        this.setData({ req_list: this.data.req_list.concat(res) });
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

      this.data.page = 1;
      this.data.req_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.getReqList(() => {
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
        this.getReqList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  }
});