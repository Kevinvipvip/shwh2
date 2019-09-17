const app = getApp();

Page({
  data: {
    funding_id: 0,
    goods_list: [],
    nomore: false,
    nodata: true,
    active_index: -2  // -2.初始值 -1.无偿支持
  },
  onLoad(options) {
    this.data.funding_id = options.funding_id;
    this.fundingGoodsList();
  },
  // 众筹商品列表
  fundingGoodsList() {
    let post = {
      funding_id: this.data.funding_id,
      page: 1,
      perpage: 100
    };

    app.ajax('api/fundingGoodsList', post, res => {
      for (let i = 0; i < res.length; i++) {
        app.format_img(res[i].pics);
        res[i].flex_pad = app.null_arr(res[i].pics.length, 3);
      }
      this.setData({ goods_list: res });
    });
  },
  // 放大商品图
  preview(e) {
    let index = e.currentTarget.dataset.index;
    let pic_index = e.currentTarget.dataset.pic_index;

    wx.previewImage({
      current: this.data.goods_list[index].pics[pic_index],
      urls: this.data.goods_list[index].pics
    });
  },
  // 去众筹订单页
  to_chou_order(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({ active_index: index });

    if (index !== -1) {
      wx.redirectTo({ url: '/pages/chou-order-create/chou-order-create?funding_id=' + this.data.funding_id + '&goods_id=' + this.data.goods_list[index].id });
    } else {
      wx.redirectTo({ url: '/pages/chou-order-create/chou-order-create?funding_id=' + this.data.funding_id });
    }
  }
});