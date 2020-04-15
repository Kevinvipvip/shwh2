const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    xuqiu: {
      pics: [],
      flex_pad: []
    },  // 需求详情

    role: 0  // 用户角色
  },
  onLoad(options) {
    this.data.id = options.id;
    this.setData({ role: app.user_data.role });

    this.xuqiuDetail(() => {
      this.setData({ full_loading: false });
    });
  },
  // 需求详情
  xuqiuDetail(complete) {
    app.ajax('xuqiu/xuqiuDetail', { xuqiu_id: this.data.id }, res => {
      app.avatar_format(res);
      app.format_img(res.pics);
      res.flex_pad = app.null_arr(res.pics.length, 3);

      res.linkman_sb = res.linkman.slice(0, 1) + '先生';

      this.setData({ xuqiu: res });
    }, null, complete);
  },
  // 放大物品样照
  zoom(e) {
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.xuqiu.pics[index],
      urls: this.data.xuqiu.pics
    });
  },
  // 打电话
  phone_call() {
    wx.makePhoneCall({ phoneNumber: this.data.xuqiu.tel })
  }
});