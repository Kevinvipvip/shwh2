const app = getApp();

Page({
  data: {
    full_loading: true,
    id: 0,
    
    work: {},
    biddingList: []
  },
  onLoad: function (options) {
    this.data.id = options.id;
    this.worksDetail(() => {
      this.biddingList(() => {
        this.setData({full_loading: false})
      });
    });
  },
  preview(e) {
    wx.previewImage({
      current: this.data.work.pics[e.currentTarget.dataset.index],
      urls: this.data.work.pics
    })
  },
  worksDetail(complete) {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax(app.my_config.api + 'api/worksDetail', post, (res) => {
      for (let i = 0; i < res.pics.length; i++) {
        if (res.pics[i]) {
          res.pics[i] = app.my_config.base_url + '/' + res.pics[i];
        } else {
          res.pics[i].pic = app.my_config.default_img;
        }
      }

      app.avatar_format(res);

      wx.setNavigationBarTitle({ title: res.title });
      this.setData({work: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  to_bidding() {
    wx.navigateTo({ url: '/pages/bidding/bidding?work_id=' + this.data.id + '&name=' + encodeURIComponent(this.data.work.name) });
  },
  // 竞标列表
  biddingList(complete) {
    let post = {
      token: app.user_data.token,
      work_id: this.data.id
    };

    app.ajax(app.my_config.api + 'api/biddingList', post, (res) => {
      for (let i = 0; i < res.length; i++) {
        app.avatar_format(res[i]);
      }
      this.setData({biddingList: res});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 竞标提交的回调
  refresh(callback) {
    this.biddingList(() => {
      callback();
    });
  }
})