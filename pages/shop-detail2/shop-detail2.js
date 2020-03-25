const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    tab_active: 0,
    banner_type: 1,  // 1.轮播图 2.视频
  },
  onLoad(options) {
    this.data.id = options.id;
    this.setData({ full_loading: false });
  }
});