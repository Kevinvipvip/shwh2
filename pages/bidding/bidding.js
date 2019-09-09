const app = getApp()

Page({
  data: {
    work_id: 0,  // 作品id
    name: '',  // 作品名称
    desc: '',  // 竞标描述
    plat: ''
  },
  onLoad: function (options) {
    this.data.work_id = options.work_id;
    this.setData({name: decodeURI(options.name)});

    let phone = wx.getSystemInfoSync();
    this.setData({plat: phone.platform});
  },
  // 参加竞标
  uploadWorks() {
    if (!this.data.desc.trim()) {
      app.toast('请填写竞标文本');
    } else {
      let that = this;

      wx.showModal({
        title: '提示',
        content: '确认参加竞标？',
        success(res) {
          if (res.confirm) {
            let post = {
              token: app.user_data.token,
              work_id: that.data.work_id,
              desc: that.data.desc
            };

            app.ajax('api/bidding', post, (res) => {
              app.modal('已参加竞标', () => {
                let bidding_detail = app.get_page('pages/bidding-detail/bidding-detail');
                if (bidding_detail) {
                  bidding_detail.refresh(() => {
                    wx.navigateBack({ delta: 1 })
                  });
                } else {
                  wx.navigateBack({ delta: 1 })
                }
              });
            });
          }
        }
      });
    }
  },
  // common start
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  }
})