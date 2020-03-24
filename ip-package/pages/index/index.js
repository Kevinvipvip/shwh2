const app = getApp();

Page({
  data: {
    full_loading: true,

    active_tab: -1,

    nomore: true,
    nodata: false
  },
  onLoad() {
    this.setData({ full_loading: false });
  }
});