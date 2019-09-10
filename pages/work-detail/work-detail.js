const app = getApp();

Page({
  data: {
    id: 0,
    work: {}
  },
  onLoad(options) {
    this.data.id = options.id;
    this.worksDetail();
  },
  worksDetail() {
    app.ajax('api/worksDetail', {id: this.data.id}, res => {
      app.format_img(res.pics);
      app.avatar_format(res);

      res.flex_pad = app.null_arr(res.pics.length, 3);

      this.setData({work: res})
    });
  },
  // 放大图片
  preview(e) {
    wx.previewImage({
      current: this.data.work.pics[e.currentTarget.dataset.index],
      urls: this.data.work.pics
    });
  }
});