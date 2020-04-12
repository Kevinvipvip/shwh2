const app = getApp();

Page({
  data: {
    full_loading: true,

    use_type: true,

    type: -1,
    sex_list: [
      { name: '我买过的', value: 1 },
      { name: '我正在卖的', value: 2 }
    ],

    nomore: true,
    nodata: false
  },
  onLoad() {
    this.setData({ full_loading: false });
  }
});