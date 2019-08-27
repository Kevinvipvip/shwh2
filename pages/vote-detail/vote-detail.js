const app = getApp();

Page({
  data: {
    full_loading: true,
    id: 0,
    work: {}
  },
  onLoad: function (options) {
    this.data.id = options.id;
    this.worksDetail(() => {
      this.setData({full_loading: false})
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
  vote() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认给此作品投票？',
      success(res) {
        if (res.confirm) {
          let post = {
            token: app.user_data.token,
            work_id: that.data.id
          };
          app.ajax(app.my_config.api + 'api/vote', post, (res) => {
            app.modal('投票成功');
          });
        }
      }
    });
  }
})