const app = getApp();

Page({
  data: {
    funding_id: 0,
    goods_id: 0,
    num: 1,
    pay_price: '',  // 无偿支持金额
    desc: '',  // 备注
    receiver: '',  // 收货人
    tel: '',  // 电话
    address: '',  // 地址
    visible_price: 0,

    goods: {},

    textarea_padding: '15rpx',
    sub_loading: false,
  },
  onLoad(options) {
    // textarea
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    this.data.funding_id = options.funding_id;
    if (options.goods_id) {
      this.setData({ goods_id: parseInt(options.goods_id) });

      // 获取众筹商品列表，从中挑选中众筹的商品
      this.fundingGoodsList();
    }

    // 获取默认收货地址
    app.get_default_address(address => {
      if (address) {
        this.setData({
          receiver: address.receiver,
          tel: address.tel,
          address: address.address
        });
      }
    });
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
        if (res[i].id === this.data.goods_id) {
          this.setData({ goods: res[i] });
          this.computed_price();
          break;
        }
      }
    });
  },
  // 支持份数改变
  number_change(e) {
    let type = e.currentTarget.dataset.type;
    if (type === 1) {
      // 减
      if (this.data.num !== 1) {
        this.setData({ num: this.data.num - 1 });
        this.computed_price();
      }
    } else {
      // 加
      if (this.data.num !== 99) {
        this.setData({ num: this.data.num + 1 });
        this.computed_price();
      }
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 众筹商品下单
  fundingPurchase() {
    if (!this.data.sub_loading) {
      let data = this.data;
      let valid = false;
      let post;

      if (this.data.goods_id === 0) {
        // 无偿
        
        console.log(data.pay_price, '无偿');
        
        if (!data.pay_price) {
          app.toast('请填写支持金额');
        } else if (!app.my_config.reg.price.test(data.pay_price)) {
          app.toast('请填写正确的金额');
        } else {
          valid = true;
          post = {
            funding_id: data.funding_id,
            pay_price: data.pay_price,
            desc: data.desc
          };
        }
      } else {
        // 商品
        if (!data.receiver) {
          app.toast('请选择收货地址');
        } else {
          valid = true;
          post = {
            funding_id: data.funding_id,
            goods_id: data.goods_id,
            num: data.num,
            receiver: data.receiver,
            tel: data.tel,
            address: data.address,
            desc: data.desc
          }
        }
      }

      if (valid) {
        this.setData({ sub_loading: true });
        app.ajax('api/fundingPurchase', post, pay_order_sn => {
          this.fundingPay(pay_order_sn, res => {
            if (res) {
              wx.redirectTo({ url: '/pages/my-chou-orders/my-chou-orders?status=1' });
            } else {
              app.modal('支付未完成，可以在我的订单中进行后续的付款操作', () => {
                wx.redirectTo({ url: '/pages/my-chou-orders/my-chou-orders?status=0' });
              })
            }
          });
        }, null, () => {
          this.setData({ sub_loading: false });
        });
      }
    }
  },
  // 众筹支付
  fundingPay(pay_order_sn, complete) {
    app.ajax('pay/fundingPay', { pay_order_sn }, res => {
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success() {
          complete(true);
        },
        fail() {
          // app.toast('支付失败');
          complete(false);
        }
      })
    });
  },
  // 计算显示金额（金额为商品金额*数量时）
  computed_price() {
    this.setData({ visible_price: Number(this.data.goods.price * this.data.num).toFixed(2) });
  }
});