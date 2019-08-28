const app = getApp();

Page({
  data: {
    active_rank: 2
  },
  onLoad() {
  },
  // 点击排行
  rank_tap(e) {
    this.setData({active_rank: e.currentTarget.dataset.rank});
  }
});