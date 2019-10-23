const app = getApp();

Page({
  data: {
    is_ios: false,

    id: 0,
    work: {},
    loading: false,

    // 接单
    desc: '',
    desc_count: 0,

    uid: 0,
    role: 0  // 用户身份
  },
  onLoad(options) {
    this.setData({ is_ios: app.is_ios });

    this.data.id = options.id;
    this.showWorksDetail();

    this.setData({
      uid: app.user_data.uid,
      role: app.user_data.role
    });
  },
  showWorksDetail() {
    app.ajax('home/showWorksDetail', { id: this.data.id }, res => {
      app.format_img(res.pics);
      app.avatar_format(res);
      app.time_format(res, 'create_time', 'yyyy-MM-dd');

      res.flex_pad = app.null_arr(res.pics.length, 3);

      this.setData({ work: res })
    });
  },
  // 放大图片
  preview(e) {
    wx.previewImage({
      current: this.data.work.pics[e.currentTarget.dataset.index],
      urls: this.data.work.pics
    });
  },
  // 关注/取关
  iFocus() {
    let work = this.data.work;
    if (!this.data.loading) {
      this.data.loading = true;

      app.ajax('note/iFocus', { to_uid: work.uid }, res => {
        this.setData({ ['work.ifocus']: res });
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'desc') {
      this.setData({ desc_count: this.data.desc.length });
    }
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.work.uid });
    });
  }
});