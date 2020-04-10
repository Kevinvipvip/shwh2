const app = getApp();

Page({
  data: {
    full_loading: true
  },
  onLoad() {
    this.setData({ full_loading: false });
  }
});