const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    id: 0,
    goods: {},
    rich_text: {},
    add_loading: false,  // 加入购物车loading
    attr_show: false,
    attr_active: false,
    attr_index: 0,  // 选中的参数索引，默认为第一个
    buy_type: 1, // 1.购买 2.购物车
    amount: 0  // 购买数量
  },
  onLoad(options) {
    this.data.id = options.id;
    this.goodsDetail();
  },
  // 商品详情
  goodsDetail() {
    let post = {
      id: this.data.id,
      token: app.user_data.token
    };

    app.ajax('shop/goodsDetail', post, (res) => {
      // for (let i = 0; i < res.pics.length; i++) {
      //   res.pics[i] = app.my_config.base_url + '/' + res.pics[i];
      // }
      app.format_img(res.pics);
      this.setData({ goods: res });
      let rich_text = res.detail;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  },
  // 点击购买
  buy() {
    let data = this.data;

    if (data.goods.stock === 0) {
      app.toast('该商品已告罄！');
    } else {
      let amount;
      if (data.goods.use_attr === 1) {
        if (data.amount === 0) {
          amount = data.goods.attr_list[data.attr_index].stock !== 0 ? 1 : 0;
        } else {
          amount = data.amount;
        }
      } else {
        amount = data.amount || 1;
      }

      this.setData({
        attr_show: true,
        buy_type: 1,
        amount: amount
      }, () => {
        this.setData({ attr_active: true });
      });
    }
  },
  // 点击加入购物车
  cartAdd() {
    let data = this.data;

    if (this.data.goods.stock === 0) {
      app.toast('该商品已告罄！');
    } else {
      let amount;
      if (data.goods.use_attr === 1) {
        if (this.data.amount === 0) {
          amount = data.goods.attr_list[data.attr_index].stock !== 0 ? 1 : 0;
        } else {
          amount = data.amount;
        }
      } else {
        amount = data.amount || 1;
      }

      this.setData({
        attr_show: true,
        buy_type: 2,
        amount: amount
      }, () => {
        this.setData({ attr_active: true });
      });
    }
  },
  // 购买或加入购物车，取决于buy_type的值
  buy_btn() {
    if (this.data.buy_type === 1) {
      if (this.data.amount === 0) {
        app.toast('请至少选择一件商品');
      } else {
        let data = this.data;
        let attr_id;
        if (data.goods.use_attr === 1) {
          attr_id = data.goods.attr_list[data.attr_index].id;
        } else {
          attr_id = 1;
        }
        wx.redirectTo({ url: '/pages/order-create/order-create?id=' + data.id + '&num=' + data.amount + '&attr_id=' + attr_id })
      }
    } else {
      if (this.data.amount === 0) {
        app.toast('请至少选择一件商品');
      } else {
        if (!this.data.add_loading) {
          this.data.add_loading = true;

          let data = this.data;
          let post = {
            token: app.user_data.token,
            goods_id: data.id,
            num: data.amount
          };

          if (data.goods.use_attr === 1) {
            post.attr_id = data.goods.attr_list[data.attr_index].id;
          }

          app.ajax('shop/cartAdd', post, () => {
            let set_data = {
              attr_show: false,
              attr_active: false,
              attr_index: 0,
              amount: 0,
              ['goods.stock']: data.goods.stock - data.amount
            };

            if (data.goods.use_attr === 1) {
              set_data['goods.attr_list[' + data.attr_index + '].stock'] = data.goods.attr_list[data.attr_index].stock - data.amount;
            }

            this.setData(set_data);
            app.toast('已加入购物车~');

            let shop_page = app.get_page('pages/shop/shop');
            if (shop_page) {
              shop_page.cartList();
            }
          }, (err) => {
            app.toast(err.message);
          }, () => {
            this.data.add_loading = false;
          });
        }
      }
    }
  },
  // 去我的购物车
  to_shop_car() {
    wx.navigateTo({ url: '/pages/shop-car/shop-car' });
  },
  // 隐藏参数框
  hide() {
    this.setData({
      attr_show: false,
      attr_active: false
    });
  },
  // 增加
  add() {
    let data = this.data;
    if (data.goods.use_attr === 1) {
      if (data.amount === data.goods.limit || data.amount === data.goods.attr_list[data.attr_index].stock) {
        if (data.amount === data.goods.limit) {
          app.toast('该商品最多限购' + data.goods.limit + '件哦');
        } else {
          app.toast('已经没有这么多商品了');
        }
      } else {
        this.setData({ amount: data.amount + 1 });
      }
    } else {
      if (data.amount === data.goods.limit || data.amount === data.goods.stock) {
        if (data.amount === data.goods.limit) {
          app.toast('该商品最多限购' + data.goods.limit + '件哦');
        } else {
          app.toast('已经没有这么多商品了');
        }
      } else {
        this.setData({ amount: data.amount + 1 });
      }
    }
  },
  // 减少
  sub() {
    let data = this.data;
    if (this.data.amount !== 1) {
      this.setData({ amount: data.amount - 1 });
    }
  },
  // 选择参数
  attr_choose(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data;
    if (data.goods.attr_list[index].stock === 0) {
      app.toast('该商品已告罄！');
    } else if (data.goods.attr_list[index].stock < data.amount) {
      app.toast('“' + data.goods.attr_list[index].value + '”只有' + data.goods.attr_list[index].stock + '件了');
      this.setData({
        amount: data.goods.attr_list[index].stock,
        attr_index: index
      });
    } else {
      this.setData({ attr_index: index });
    }
  }
})