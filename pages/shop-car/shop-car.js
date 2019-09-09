const app = getApp();

Page({
  data: {
    cartList: [],
    carriage: 0,  // 运费
    total: 0,  // 总计
    check_all: true,
    amount_change_loading: false
  },
  onLoad() {
    this.cartList();
  },
  // 我的购物车
  cartList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('shop/cartList', post, (res) => {
      for (let i = 0; i < res.length; i++) {
        res[i].cover = app.my_config.base_url + '/' + res[i].cover;
        res[i].checked = true;  // 开始商品是全选的
      }

      this.setData({ cartList: res }, () => {
        this.price_compute();
      });
    });
  },
  // 选择要结算的商品
  check(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({['cartList[' + index + '].checked']: !this.data.cartList[index].checked});
    this.price_compute();
    this.check_check_all();
  },
  // 检查商品是否全选
  check_check_all() {
    let check_all = true;
    for (let i = 0; i < this.data.cartList.length; i++) {
      if (!this.data.cartList[i].checked) {
        check_all = false;
        break;
      }
    }

    this.setData({check_all: check_all});
  },
  // 点击check_all按钮
  check_all_click() {
    this.data.check_all = !this.data.check_all;
    for (let i = 0; i < this.data.cartList.length; i++) {
      this.data.cartList[i].checked = this.data.check_all;
    }
    this.setData({
      check_all: this.data.check_all,
      cartList: this.data.cartList
    });
    this.price_compute();
  },
  // 计算价格（运费，总计）
  price_compute() {
    let cartList = this.data.cartList;

    let carriage = 0, total = 0;
    for (let i = 0; i < cartList.length; i++) {
      if (cartList[i].checked) {
        carriage += Number(cartList[i].carriage);
        total += Number(cartList[i].total_price) + Number(cartList[i].carriage);
      }
    }

    this.setData({
      carriage: carriage.toFixed(2),
      total: total.toFixed(2)
    });
  },
  to_cart_order() {
    let cartList = this.data.cartList, ids = [];
    for (let i = 0; i < cartList.length; i++) {
      if (cartList[i].checked) {
        ids.push(cartList[i].id);
      }
    }
    if (ids.length === 0) {
      app.toast('请选择要结算的商品');
    } else {
      wx.redirectTo({ url: '/pages/cart-order-create/cart-order-create?ids=' + ids.toString() });
    }
  },
  // 数量增加
  cartInc(e) {
    if (!this.data.amount_change_loading) {
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;

      if (this.data.cartList[index].num < this.data.cartList[index].limit) {
        this.data.amount_change_loading = true;

        let post = {
          token: app.user_data.token,
          cart_id: id
        };

        app.ajax('shop/cartInc', post, (res) => {
          this.setData({
            ['cartList[' + index + '].num']: res.num,
            ['cartList[' + index + '].total_price']: res.total_price
          });
        }, null, () => {
          this.data.amount_change_loading = false;
          this.price_compute();
        });
      } else {
        app.toast('该商品最多限购' + this.data.cartList[index].limit + '件哦');
      }
    }
  },
  // 数量减少
  cartDec(e) {
    if (!this.data.amount_change_loading) {
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;

      if (this.data.cartList[index].num > 1) {
        this.data.amount_change_loading = true;

        let post = {
          token: app.user_data.token,
          cart_id: id
        };

        app.ajax('shop/cartDec', post, (res) => {
          this.setData({
            ['cartList[' + index + '].num']: res.num,
            ['cartList[' + index + '].total_price']: res.total_price
          });
        }, null, () => {
          this.data.amount_change_loading = false;
          this.price_compute();
        });
      }
    }
  }
})