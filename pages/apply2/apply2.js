const app = getApp()

Page({
  data: {
    textarea_padding: '15rpx',
    role: '1',
    org: '',
    name: '',
    identity: '',
    cover: '',
    id_front: '',
    id_back: '',
    tel: '',
    weixin: '',
    license: '',
    desc: '',
    works: [],

    // 验证码相关
    code: '',
    code_text: '发送验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0,

    auth: 0,  // 0.未认证 1.审核中 2.已认证 3.审核拒绝
    reason: '',
    loading: true,
    apply_loading: false,
  },
  onLoad: function (options) {
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
        role_text = '文创机构';
        break;
      case '3':
        role_text = '设计师';
        break;
      case '4':
        role_text = '工厂';
        break;
    }

    wx.setNavigationBarTitle({ title: '申请成为' + role_text });

    this.setData({ role: options.role });

    this.applyStatus(() => {
      if (this.data.auth === 3) {
        this.applyInfo(() => {
          this.setData({ loading: false });
        });
      } else {
        this.setData({ loading: false });
      }
    });
  },
  apply() {
    if (!this.data.apply_loading) {
      let data = this.data, valid = false, post = {};
      if (data.role !== '3') {
        if (!data.org.trim()) {
          app.toast('请填写机构名称');
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
        } else if (!data.tel.trim()) {
          app.toast('请填写法人手机号');
        } else if (!app.my_config.reg.tel.test(data.tel)) {
          app.toast('手机号格式不正确');
        } else if (!this.data.license) {
          app.toast('请上传资质证书');
        } else if (!data.code.trim()) {
          app.toast('请填写验证码');
        } else {
          valid = true;
          post.org = data.org;
          post.license = this.format_up_img(data.license);
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

        post.token = app.user_data.token;
        post.role = data.role;
        post.name = data.name;
        post.identity = data.identity;
        post.cover = this.format_up_img(data.cover);
        post.id_front = this.format_up_img(data.id_front);
        post.id_back = this.format_up_img(data.id_back);
        post.tel = data.tel;
        post.weixin = data.weixin;
        post.desc = data.desc;
        post.code = data.code;

        app.ajax(app.my_config.api + 'my/apply', post, () => {
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
    return url.replace(app.my_config.base_url + '/', '');
  },
  img_upload(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        let limit = [[524288, '512K'], [2097152, '2M']];
        let field_index = e.currentTarget.dataset.name === 'cover' ? 0 : 1;
        if (res.tempFiles[0].size > limit[field_index][0]) {
          app.toast('上传的图片不能大于' + limit[field_index][1]);
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: app.my_config.api + 'api/uploadImage2m',
            filePath: res.tempFiles[0].path,
            name: 'file',
            formData: {
              token: app.user_data.token
            },
            success(res) {
              res = JSON.parse(res.data);
              that.setData({ [e.currentTarget.dataset.name]: app.my_config.base_url + '/' + res.data.path });
            },
            fail() {
              app.toast('上传失败');
            },
            complete: function () {
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  img_remove(e) {
    this.setData({ [e.currentTarget.dataset.name]: '' });
  },
  work_upload() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if (res.tempFiles[0].size > 2097152) {
          app.toast('上传的图片不能大于2M');
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: app.my_config.api + 'api/uploadImage2m',
            filePath: res.tempFiles[0].path,
            name: 'file',
            formData: {
              token: app.user_data.token
            },
            success(res) {
              res = JSON.parse(res.data);
              that.data.works.push(app.my_config.base_url + '/' + res.data.path);
              that.setData({ works: that.data.works });
            },
            fail() {
              app.toast('上传失败');
            },
            complete: function () {
              wx.hideLoading();
            }
          })
        }
      }
    })
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

        app.ajax(app.my_config.api + 'my/sendSms', post, (res) => {
          app.toast('已发送');
          this.setData({ code_text: this.data.count_down + 's' });
          this.data.code_flag = setInterval(() => {
            this.data.count_down--;
            if (this.data.count_down === 0) {
              this.data.count_down = 60;
              this.setData({
                code_text: '发送验证码',
                code_disabled: true
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
  auth: 0.未认证 1.审核中 2.已认证 3.审核拒绝
   */
  applyStatus(callback) {
    let post = {
      token: app.user_data.token
    };

    app.ajax(app.my_config.api + 'my/applyStatus', post, (res) => {
      this.setData({ auth: res.auth });
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

    app.ajax(app.my_config.api + 'my/applyInfo', post, (res) => {
      let data = {
        role: res.role,
        org: res.org,
        name: res.name,
        identity: res.identity,
        id_front: res.id_front ? app.my_config.base_url + '/' + res.id_front : '',
        id_back: res.id_back ? app.my_config.base_url + '/' + res.id_back : '',
        tel: res.tel,
        weixin: res.weixin,
        license: res.license ? app.my_config.base_url + '/' + res.license : '',
        desc: res.desc,
        reason: res.reason,
        cover: res.cover ? app.my_config.base_url + '/' + res.cover : '',
        works: []
      };

      if (res.works && res.works.length > 0) {
        for (let i = 0; i < res.works.length; i++) {
          data.works.push(app.my_config.base_url + '/' + res.works[i]);
        }
      }

      // 这个实际上只有 auth == 3 的时候才用的上，上面也判断的 auth == 3 的时候才会调用、
      switch (res.role) {
        case 1:
          data.role_text = '博物馆';
          break;
        case 2:
          data.role_text = '文创机构';
          break;
        case 3:
          data.role_text = '设计师';
          break;
        case 4:
          data.role_text = '工厂';
          break;
      }

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
      if (this.data.auth === 3) {
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