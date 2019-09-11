const app = getApp();

Page({
  data: {
    type: 0,  // 0.我的地址 1.order-create选择地址 2.cart-order-create选择地址 4.support-options选择地址
    address_list: []
  },
  onLoad: function (options) {
    if (options.type) {
      this.data.type = parseInt(options.type);
    }
    this.addressList();
  },
  // 当地址用于选择
  choose(e) {
    if (this.data.type !== 0) {
      let address = e.currentTarget.dataset.address;
      let choose_page;
      switch (this.data.type) {
        case 1:
          choose_page = app.get_page('pages/order-create/order-create');
          break;
        case 2:
          choose_page = app.get_page('pages/cart-order-create/cart-order-create');
          break;
        case 3:
          choose_page = app.get_page('pages/recharge/recharge');
          break;
        case 4:
          choose_page = app.get_page('pages/chou-order-create/chou-order-create');
          break;
      }
      choose_page.choose_address(address.username, address.tel, address.provincename + ' ' + address.cityname + ' ' + address.countyname + ' ' + address.detail, () => {
        wx.navigateBack({ delta: 1 });
      });
    }
  },
  // 获取我的收货地址
  addressList(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/addressList', post, (res) => {
      this.setData({ address_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 去添加地址页面
  to_addressAdd() {
    wx.navigateTo({ url: '/pages/address-detail/address-detail' });
  },
  // 选择微信地址
  choose_address() {
    let that = this;
    wx.chooseAddress({
      success(res) {
        wx.showLoading({
          title: '添加中',
          mask: true
        });

        that.addressAdd(res.userName, res.telNumber, res.provinceName, res.cityName, res.countyName, res.detailInfo, res.postalCode, that.data.address_list.length === 0 ? 1 : 0, () => {
          wx.hideLoading();
          app.toast('添加成功', 2000, 'success')
          that.addressList();
        });
      },
      fail(err) {
        if (err.errMsg.indexOf('auth') !== -1) {
          wx.showModal({
            title: '提示',
            content: '请先授权获取您的通讯地址',
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    if (res.authSetting['scope.address']) {
                      wx.chooseAddress({
                        success(res) {
                          wx.showLoading({
                            title: '添加中',
                            mask: true
                          });

                          that.addressAdd(res.userName, res.telNumber, res.provinceName, res.cityName, res.countyName, res.detailInfo, res.postalCode, that.data.address_list.length === 0 ? 1 : 0, () => {
                            wx.hideLoading();
                            app.toast('添加成功', 2000, 'success')
                            that.addressList();
                          });
                        }
                      })
                    }
                  }
                })
              }
            }
          });
        }
      }
    })
  },
  // 添加收货地址
  addressAdd(username, tel, provincename, cityname, countyname, detail, postalcode, is_default, complete) {
    let post = {
      token: app.user_data.token,
      username: username,
      tel: tel,
      provincename: provincename,
      cityname: cityname,
      countyname: countyname,
      detail: detail,
      postalcode: postalcode,
      default: is_default
    };

    app.ajax('my/addressAdd', post, () => {
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  }
})