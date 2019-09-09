const app = getApp();

Page({
  data: {
    req_id: 0,
    origin: null,  // 来源 1.投票页 2.竞标页
    nodata: false,
    worksList: []
  },
  onLoad: function (options) {
    this.data.req_id = options.req_id;
    this.setData({origin: options.origin})
    this.worksList();
  },
  worksList(complete) {
    let post = {
      token: app.user_data.token,
      req_id: this.data.req_id
    };
    
    app.ajax('api/worksList', post, (res) => {
      if (res.length === 0) {
        this.setData({nodata: true});
      } else {
        for (let i = 0; i < res.length; i++) {
          if (res[i].cover) {
            res[i].cover = app.my_config.base_url + '/' + res[i].cover;
          } else {
            res[i].cover = app.my_config.default_img;
          }
        }
        this.setData({worksList: res});
      }
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    this.nodata = false;
    wx.showNavigationBarLoading();
    this.worksList(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  // 跳转投票详情或竞标详情
  jump(e) {
    if (this.data.origin === '1') {
      wx.navigateTo({ url: '/pages/vote-detail/vote-detail?id=' + e.currentTarget.dataset.id });
    } else {
      wx.navigateTo({ url: '/pages/bidding-detail/bidding-detail?id=' + e.currentTarget.dataset.id });
    }
  }
})