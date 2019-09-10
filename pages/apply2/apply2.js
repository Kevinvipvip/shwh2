const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',
    role: '1',  // 1.博物馆 2.设计师 3.工厂
    cover: '',  // 封面
    org: '',  // 组织结构（非设计师）
    address: '',  // 组织地址（非设计师）
    name: '',  // 法人代表（真实姓名）
    identity: '',  // 身份证号
    id_front: '',  // 身份证正面照片
    id_back: '',  // 身份证反面照片
    license: '',  // 资质证书
    tel: '',  // 仅作为申请时联系电话
    weixin: '',  // 微信号（选填）
    busine: '',  // 经营范围（仅工厂填）
    works: [],  // 作品（最多6张），仅设计师传

    // 验证码相关
    code: '',
    code_text: '发送验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0,

    role_check: 0,  // 0.未认证 1.审核中 2.已认证 3.审核拒绝
    reason: '',
    loading: true,
    apply_loading: false,
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    let role_text = '';
    switch (options.role) {
      case '1':
        role_text = '博物馆';
        break;
      case '2':
        role_text = '设计师';
        break;
      case '3':
        role_text = '工厂';
        break;
    }

    wx.setNavigationBarTitle({ title: '申请成为' + role_text });

    this.setData({ role: options.role });

    this.applyStatus(() => {
      if (this.data.role_check === 3) {
        this.applyInfo(() => {
          this.setData({ loading: false });
        });
      } else {
        this.setData({ loading: false });
      }
    });

    app.qiniu_init();
  },
  apply() {
    if (!this.data.apply_loading) {
      let data = this.data, valid = false, post = {};
      if (data.role !== '2') {
        if (!data.org.trim()) {
          app.toast('请填写机构名称');
        } else if (!data.address.trim()) {
          app.toast('请填写机构地址');
        } else if (!data.name.trim()) {
          app.toast('请填写法人代表');
        } else if (!data.identity.trim()) {
          app.toast('请填写身份证号');
        } else if (!data.cover) {
          app.toast('请上传封面');
        } else if (!data.id_front) {
          app.toast('请上传身份证正面');
        } else if (!data.id_back) {
          app.toast('请上传身份证反面');
        } else if (!this.data.license) {
          app.toast('请上传资质证书');
        } else if (!data.tel.trim()) {
          app.toast('请填写法人手机号');
        } else if (!app.my_config.reg.tel.test(data.tel)) {
          app.toast('手机号格式不正确');
        } else if (!data.code.trim()) {
          app.toast('请填写验证码');
        } else {
          if (data.role === '3') {
            if (!data.busine.trim()) {
              app.toast('请填写经营范围');
            } else {
              valid = true;
              post.org = data.org;
              post.address = data.address;
              post.busine = data.busine;
            }
          } else {
            valid = true;
            post.org = data.org;
            post.address = data.address;
          }
        }
      } else {
        if (!data.name.trim()) {
          app.toast('请填写姓名');
        } else if (!data.identity.trim()) {
          app.toast('请填写身份证号');
        } else if (!data.cover) {
          app.toast('请上传照片');
        } else if (!data.id_front) {
          app.toast('请上传身份证正面');
        } else if (!data.id_back) {
          app.toast('请上传身份证反面');
        } else if (!this.data.license) {
          app.toast('请上传资质证书');
        } else if (!data.tel.trim()) {
          app.toast('请填写手机号');
        } else if (!app.my_config.reg.tel.test(data.tel)) {
          app.toast('手机号格式不正确');
        } else if (data.works.length === 0) {
          app.toast('请至少上传一张作品');
        } else if (!data.code.trim()) {
          app.toast('请填写验证码');
        } else {
          valid = true;
          for (let i = 0; i < data.works.length; i++) {
            data.works[i] = this.format_up_img(data.works[i]);
          }
          post.works = data.works;
        }
      }

      if (valid) {
        this.setData({ apply_loading: true });

        post.role = data.role;
        post.cover = this.format_up_img(data.cover);
        post.license = this.format_up_img(data.license);
        post.name = data.name;
        post.identity = data.identity;
        post.id_front = this.format_up_img(data.id_front);
        post.id_back = this.format_up_img(data.id_back);
        post.tel = data.tel;
        post.code = data.code;
        post.weixin = data.weixin;

        app.ajax('my/apply', post, () => {
          this.applyStatus(() => {
            this.setData({ apply_loading: false });
          });
        }, null, () => {
          this.setData({ apply_loading: false });
        });
      }
    }
  },
  // 格式化上传图片路径
  format_up_img(url) {
    return url.replace(app.my_config.qiniu_base + '/', '');
  },
  img_upload(e) {
    let field = e.currentTarget.dataset.name;

    app.choose_img(1, res => {
      wx.showLoading({
        title: '上传中',
        mask: true
      });
      let tname = app.qiniu_tname() + res[0].ext;
      app.qiniu_upload(res[0].path, tname, () => {
        this.setData({ [field]: app.format_img(tname) });
      }, () => {
        wx.hideLoading();
      });
    }, 1048576);
  },
  img_remove(e) {
    this.setData({ [e.currentTarget.dataset.name]: '' });
  },
  work_upload() {
    app.choose_img(6 - this.data.works.length, res => {
      for (let i = 0; i < res.length; i++) {
        let tname = app.qiniu_tname() + res[i].ext;
        app.qiniu_upload(res[i].path, tname, () => {
          this.data.works.push(app.format_img(tname));
          this.setData({ works: this.data.works});
        });
      }
    }, 1048576);
  },
  work_remove(e) {
    this.data.works.splice(e.currentTarget.dataset.index, 1);
    this.setData({ works: this.data.works });
  },
  sendSms() {
    if (!this.data.code_disabled) {
      if (!this.data.tel.trim()) {
        app.toast('请填写手机号');
      } else if (!app.my_config.reg.tel.test(this.data.tel)) {
        app.toast('手机号格式不正确');
      } else {
        this.setData({ code_disabled: true });

        let post = {
          token: app.user_data.token,
          tel: this.data.tel
        };

        app.ajax('my/sendSms', post, (res) => {
          app.toast('已发送');
          this.setData({ code_text: this.data.count_down + 's' });
          this.data.code_flag = setInterval(() => {
            this.data.count_down--;
            if (this.data.count_down === 0) {
              this.data.count_down = 60;
              this.setData({
                code_text: '发送验证码',
                code_disabled: false
              });
              clearInterval(this.data.code_flag);
            } else {
              this.setData({ code_text: this.data.count_down + 's' });
            }
          }, 1000)
        }, (err) => {
          app.toast(err.message);
          this.setData({ code_disabled: false });
        });
      }
    }
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  /*
  获取用户状态
  role_check: 0.未认证 1.审核中 2.已认证 3.审核拒绝
   */
  applyStatus(callback) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/applyStatus', post, (res) => {
      this.setData({ role_check: res.role_check });
      if (callback) {
        callback();
      }
    });
  },
  // 获取申请信息
  applyInfo(callback, complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/applyInfo', post, (res) => {
      app.format_img(res, 'cover');
      app.format_img(res, 'id_front');
      app.format_img(res, 'id_back');
      app.format_img(res, 'license');
      app.format_img(res.works);

      let data = {
        role: res.role + '',
        org: res.org,
        address: res.address,
        name: res.name,
        identity: res.identity,
        tel: res.tel,
        weixin: res.weixin,
        busine: res.busine,
        reason: res.reason,
        code: '',
        cover: res.cover,
        id_front: res.id_front,
        id_back: res.id_back,
        license: res.license,
        works: res.works
      };

      // if (res.works && res.works.length > 0) {
      //   for (let i = 0; i < res.works.length; i++) {
      //     data.works.push(app.my_config.base_url + '/' + res.works[i]);
      //   }
      // }

      switch (res.role) {
        case 1:
          data.role_text = '博物馆';
          break;
        case 2:
          data.role_text = '设计师';
          break;
        case 3:
          data.role_text = '工厂';
          break;
      }

      wx.setNavigationBarTitle({ title: '申请成为' + data.role_text });

      this.setData(data);

      if (callback) {
        callback();
      }
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading();
    this.applyStatus(() => {
      if (this.data.role_check === 3) {
        this.applyInfo(null, () => {
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh();
        })
      } else {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  switch_my() {
    wx.switchTab({ url: '/pages/my/my' });
  }
});