const app = getApp();

Page({
  data: {
    full_loading: true,

    type: 2,  // 1.我的关注 2.我的粉丝

    nomore: true,
  },
  onLoad(options) {
    this.setData({ type: options.type });
    this.setData({ full_loading: false });
  }
});