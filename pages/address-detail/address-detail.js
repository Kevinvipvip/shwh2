const app = getApp();

Page({
  data: {
    id: 0,  // 新增为0
    username: '',  // 联系人
    tel: '',  // 手机号码
    provincename: '',  // 省
    cityname: '',  // 市
    countyname: '',  // 区
    detail: '',  // 地址详情
    postalcode: '',  // 邮编
    default: 0,  // 0.非默认 1.默认
    
    citys: [],  // 默认选择的省市区，用于修改

    loading: false
  },
  onLoad(options) {
    if (options.id) {
      this.data.id = options.id;
      this.addressDetail();
    }
  },
  // 添加收货地址
  addressAdd() {
    let data = this.data;
    let that = this;
    if (!data.username.trim()) {
      app.toast('请填写联系人');
    } else if (!data.tel.trim()) {
      app.toast('请填写手机号码');
    } else if (!app.my_config.reg.tel.test(data.tel)) {
      app.toast('手机号格式不正确');
    } else if (!data.provincename) {
      app.toast('请选择省市区');
    } else if (!data.detail.trim()) {
      app.toast('请填写详细地址');
    } else if (!data.postalcode.trim()) {
      app.toast('请填写邮政编码');
    } else {
      wx.showModal({
        title: '提示',
        content: '确定保存？',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '保存中',
              mask: true
            });

            let post = {
              token: app.user_data.token,
              username: data.username,
              tel: data.tel,
              provincename: data.provincename,
              cityname: data.cityname,
              countyname: data.countyname,
              detail: data.detail,
              postalcode: data.postalcode,
              default: data.default
            };

            // 新增或是修改
            let method;
            if (that.data.id) {
              post.id = that.data.id;
              method = 'my/addressMod';
            } else {
              method = 'my/addressAdd';
            }

            app.ajax(app.my_config.api + method, post, () => {
              let my_address = app.get_page('pages/my-address/my-address');
              if (my_address) {
                my_address.addressList(() => {
                  wx.navigateBack({ delta: 1 });
                });
              } else {
                wx.navigateBack({ delta: 1 });
              }
            }, null, () => {
              wx.hideLoading();
            });
          }
        }
      });
    }
  },
  // 弹出城市选择器
  citys_change(e) {
    let citys = e.detail.value;
    this.setData({
      provincename: citys[0],
      cityname: citys[1],
      countyname: citys[2],
      postalcode: e.detail.postcode
    });
  },
  // 是否设为默认收货地址
  set_default() {
    this.setData({ default: this.data.default === 0 ? 1 : 0 });
  },
  bind_input: function (e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  // 获取地址详情
  addressDetail() {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax(app.my_config.api + 'my/addressDetail', post, (res) => {
      this.setData({
        username: res.username,
        tel: res.tel,
        provincename: res.provincename,
        cityname: res.cityname,
        countyname: res.countyname,
        detail: res.detail,
        postalcode: res.postalcode,
        default: res.default,
        citys: [res.provincename, res.cityname, res.countyname]
      });
    });
  }
})