const app = getApp();

Page({
  data: {
    active_tab: -1,
    custom_active: 0,  // 0.免费打样专区 1.小批量定制 2.免开模费

    page: 1,
    list: [],
    nomore: true,
    nodata: false,
    loading: false
  },
  onLoad() {
  }
});