const app = getApp();

Page({
  data: {
    full_loading: true,

    t_focus: false,
    active_index: 1,  // 0.店铺商品 1.所有笔记 2.个人简介

    // 商品列表
    goods_list: [],
    goods_page: 1,
    goods_nomore: false,
    goods_nodata: false,

    // 笔记列表
    note_list: [
      {
        img_list: [0],
        flex_pad: []
      },
      {
        img_list: [0, 1, 2, 3],
        flex_pad: []
      },
      {
        img_list: [0, 1, 2],
        flex_pad: []
      },
      {
        img_list: [0, 1, 2, 3, 4, 5, 6, 7],
        flex_pad: [null]
      }
    ],
    note_page: 1,
    note_nomore: true,
    note_nodata: false,
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '上海博物馆' });

    this.setData({ full_loading: false });
  }
});