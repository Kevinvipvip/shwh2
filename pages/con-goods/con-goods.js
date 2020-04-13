const app = getApp();

Page({
  data: {
    full_loading: true,

    role: 0,

    goods_id: 0,

    type: 0,
    type_list: [
      { name: '我买过的', value: 1 },
      { name: '我正在卖的', value: 2 }
    ],
    goods_list: [],
    nodata: false
  },
  onLoad(options) {
    this.setData({ role: app.user_data.role });

    if (options.goods_id) {
      this.setData({ goods_id: options.goods_id });
    }

    this.goodsList(() => {
      this.setData({ full_loading: false });
    });
  },
  // 选择类型
  type_choose(e) {
    this.setData({ type: e.detail.value }, () => {
      this.goodsList();
    });
  },
  // 笔记关联商品列表
  goodsList(complete) {
    let post = {
      type: this.data.type_list[this.data.type].value
    };

    app.ajax('note/goodsList', post, res => {
      if (res.length === 0) {
        this.setData({ nodata: true });
      } else {
        this.setData({ nodata: false });
      }

      app.format_img(res, 'poster');
      this.setData({ goods_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 选择商品
  choose_goods(e) {
    let goods = e.currentTarget.dataset.goods;
    let np_page = app.get_prev_page();

    console.log(goods, np_page);

    np_page.set_goods(goods);
    this.setData({ goods_id: goods.goods_id }, () => {
      wx.navigateBack();
    });
  }
});