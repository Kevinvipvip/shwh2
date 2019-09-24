const app = getApp();

Page({
  data: {
    active_index: 0,
    cate_list: []
  },
  onLoad() {
    this.cateList();
  },
  tab_change(e) {
    this.setData({ active_index: e.currentTarget.dataset.index });
  },
  cateList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('shop/cateList', post, (res) => {
      app.format_img(res, 'icon');
      for (let i = 0; i < res.length; i++) {
        app.format_img(res[i].child, 'icon');
        // for (let j = 0; j < res[i].child.length; j++) {
        //   res[i].child[j].icon = app.my_config.base_url + '/' + res[i].child[j].icon;
        // }
      }
      this.setData({cate_list: res})
    });
  },
  // 去特定类目商品页
  to_cate_shop(e) {
    let cate = e.currentTarget.dataset.cate;
    wx.navigateTo({ url: '/pages/cate-shop/cate-shop?id=' + cate.id + '&cate_name=' + encodeURI(cate.cate_name) });
  }
})