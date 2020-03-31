const app = getApp();

Page({
  data: {
    full_loading: true,
    piao_active: 1,  // 1.需要发票 2.无需发票
    yang_active: 1,  // 1.有样品 2.无样品
    area_active: 1,  // 1.全国 2.北上广 3.天津

    desc: '',

    is_ios: false
  },
  onLoad() {
    this.setData({ full_loading: false });

    this.setData({ is_ios: app.is_ios });

    app.qiniu_init();
  },
  // 上传图片
  up_pics() {
    app.choose_img(9 - this.data.pics.length, res => {
      if (res) {
        let up_succ = 0;

        wx.showLoading({
          title: '上传中',
          mask: true
        });

        for (let i = 0; i < res.length; i++) {
          let tname = app.qiniu_tname() + res[i].ext;
          app.qiniu_upload(res[i].path, tname, () => {
            this.data.pics.push({ pic: app.format_img(tname) });
            this.setData({
              pics: this.data.pics,
              flex_pad: app.null_arr(this.data.pics.length + 1, 3)
            });
            up_succ++;

            if (up_succ === res.length) {
              wx.hideLoading();
            }
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    }, 262144);
  },
  img_load(e) {
    this.setData({
      ['pics[' + e.currentTarget.dataset.index + '].width']: e.detail.width,
      ['pics[' + e.currentTarget.dataset.index + '].height']: e.detail.height
    });
  }
});