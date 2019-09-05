const app = getApp();

Page({
  data: {
    active_tab: 2,

    // 创意
    chuang_nomore: false,
    chuang_nodata: true,
    chuang_sort: 2,

    // 作品

    // 众筹
    chou_nomore: false,
    chou_nodata: true,
  },
  onLoad(options) {
  },
  // 点击排行
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  }
});