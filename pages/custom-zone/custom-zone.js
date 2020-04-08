const app = getApp();

Page({
  data: {
    full_loading: true,

    active_index: 0,  // 0.小批量定制 1.免费拿样 2.免开模费

    nomore: true,
    nodata: false
  },
  onLoad() {
    this.setData({ full_loading: false });
  }
});