const app = getApp();

Page({
  data: {
    full_loading: true,
    nomore: true,
    nodata: false
  },
  onLoad() {
    this.setData({ full_loading: false });
  }
});