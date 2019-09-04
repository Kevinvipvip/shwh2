const app = getApp();

Page({
  data: {
    active_rank: 1,
    chuang_nomore: false,
    chuang_nodata: true,
    chuang_sort: 1
  },
  onLoad(options) {
  },
  // 点击排行
  rank_tap(e) {
    this.setData({ active_rank: e.currentTarget.dataset.rank });
  }
});