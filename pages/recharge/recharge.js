const app = getApp()

Page({
  data: {
    active_index: 0,
    vipList: [],
    name: '',
    tel: '',
    address: '',
    loading: false
  },
  onLoad: function () {
    this.getVipList();

    this.addressList();
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 选择套餐
  choose(e) {
    this.setData({ active_index: e.currentTarget.dataset.index });
  },
  // 获取充值列表
  getVipList() {
    let post = {
      token: app.user_data.token
    };
    app.ajax('api/getVipList', post, (res) => {
      this.setData({ vipList: res })
    });
  },
  // 获取默认收货地址
  addressList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/addressList', post, (res) => {
      for (let i = 0; i < res.length; i++) {
        if (res[i].default === 1) {
          this.setData({
            name: res[i].username,
            tel: res[i].tel,
            address: res[i].provincename + ' ' + res[i].cityname + ' ' + res[i].countyname + ' ' + res[i].detail
          });
          break;
        }
      }
    });
  },
  // 选择收货地址，在其他页调用
  choose_address(receiver, tel, address, callback) {
    this.setData({
      name: receiver,
      tel: tel,
      address: address
    }, () => {
      if (callback) {
        callback();
      }
    });
  },
  // 充值VIP生成订单
  recharge(e) {
    if (!this.data.loading) {
      let data = this.data;
      if (!data.name.trim()) {
        app.toast('请填写姓名')
      } else if (!data.tel.trim()) {
        app.toast('请填写电话')
      } else if (!app.my_config.reg.tel.test(data.tel)) {
        app.toast('电话格式不正确')
      } else if (!data.address.trim()) {
        app.toast('请填写或选择收货地址')
      } else {
        this.data.loading = true;

        app.collectFormid(e.detail.formId);

        let post = {
          token: app.user_data.token,
          name: data.name,
          tel: data.tel,
          address: data.address,
          vip_id: data.vipList[data.active_index].id
        };

        app.ajax('api/recharge', post, (res) => {
          this.vipPay(res.order_sn, (res) => {
            this.data.loading = false;
            if (res) {
              wx.showToast({
                title: '充值成功',
                icon: 'success',
                mask: true,
                duration: 2000
              });

              setTimeout(() => {
                wx.switchTab({ url: '/pages/my/my' });
              }, 2000)
            }
          });
        }, null, () => {
          this.data.loading = false;
        });
      }
    }
  },
  // 支付
  vipPay(order_sn, complete) {
    let post = {
      token: app.user_data.token,
      order_sn: order_sn
    };

    app.ajax('pay/vipPay', post, (res) => {
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
          app.toast('支付失败');
          complete(false);
        }
      })
    });
  }
});