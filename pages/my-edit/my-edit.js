const app = getApp();

Page({
  data: {
    full_loading: true,
    plat: '',

    nickname: '',
    realname: '',
    sex: -1,
    sex_data: [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ],
    age: 0,
    tel: '',
    sign: '',
    avatar: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqSIJibzjcxlUuahhmKCQJMB0icG66ia922MR7Bf4YkD4AU0H6zEK8FIsbdrJfGCAhv5g1CL70R5t06g/132',
    loading: false,
    input_modal: false,

    focus: false,
    input_type: '',
    input_value: '',
    field_name: '',
    maxlength: 0,
  },
  onLoad(options) {
    this.data.id = options.id;

    let phone = wx.getSystemInfoSync();
    this.setData({ plat: phone.platform });

    this.mydetail(() => {
      this.setData({ full_loading: false })
    });
  },
  // 获取需求详情（编辑用）
  mydetail(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/mydetail', post, (res) => {
      this.setData({
        nickname: res.nickname || '',
        realname: res.realname || '',
        sex: res.sex - 1,
        age: res.age,
        tel: res.tel || '',
        sign: res.sign || '',
        avatar: res.avatar.indexOf('http') === 0 ? res.avatar : app.my_config.base_url + '/' + res.avatar
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 选择性别
  sex_change(e) {
    this.setData({ sex: e.detail.value });
  },
  modMyInfo() {
    if (!this.data.loading) {
      let data = this.data;
      if (!data.nickname.trim()) {
        app.toast('请填写昵称');
      } else if (data.sex === -1) {
        app.toast('请选择性别');
      } else if (!app.my_config.reg.natural.test(data.age)) {
        app.toast('请填写正确的年龄');
      } else if (!data.avatar) {
        app.toast('请上传头像');
      } else {
        this.setData({ loading: true });

        let post = {
          token: app.user_data.token,
          realname: data.realname,
          nickname: data.nickname,
          sex: data.sex_data[data.sex].value,
          age: data.age,
          sign: data.sign,
          avatar: data.avatar.indexOf('https://wx.qlogo.cn/') === 0 ? data.avatar : data.avatar.replace(app.my_config.base_url + '/', '')
        };

        app.ajax('my/modMyInfo', post, () => {
          this.setData({ loading: false });

          app.modal('修改成功', () => {
            let my_page = app.get_page('pages/my/my');
            if (my_page) {
              my_page.mydetail(() => {
                wx.navigateBack({ delta: 1 });
              });
            } else {
              wx.navigateBack({ delta: 1 });
            }
          });
        }, null, () => {
          this.setData({ loading: false });
        });
      }
    }
  },
  img_upload(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if (res.tempFiles[0].size > 524288) {
          app.toast('上传的图片不能大于512K');
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: 'api/uploadImage',
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
  show_input(e) {
    let field_name = e.currentTarget.dataset.name;
    let input_type;
    let maxlength;
    let input_value;

    // 设置maxlength
    switch (field_name) {
      case 'nickname':
        maxlength = 20;
        input_type = 'text';
        break;
      case 'realname':
        maxlength = 20;
        input_type = 'text';
        break;
      case 'age':
        maxlength = 3;
        input_type = 'number';
        break;
      case 'tel':
        maxlength = 11;
        input_type = 'number';
        break;
      case 'sign':
        maxlength = 30;
        input_type = 'text';
        break;
    }

    if (field_name === 'age') {
      input_value = this.data[field_name] === 0 ? '' : this.data[field_name];
    } else {
      input_value = this.data[field_name] + '';
    }

    this.setData({
      field_name: field_name,
      input_type: input_type,
      input_value: input_value,
      maxlength: maxlength,
      input_modal: true,
      focus: true
    });
  },
  bind_input(e) {
    this.setData({ input_value: e.detail.value || '' });
  },
  input_done() {
    this.setData({
      [this.data.field_name]: this.data.input_value,
      input_modal: false
    });
  },
  hide_input_modal() {
    this.setData({ input_modal: false });
  },
  // 获取用户电话号码
  getPhoneNumber(e) {
    if (e.detail.encryptedData) {
      let post = {
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      };
      app.ajax('login/getPhoneNumber', post, () => {
        this.mydetail();
        app.modal('授权成功');
      });
    }
  }
});