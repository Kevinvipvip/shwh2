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
    avatar: '',
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

    app.qiniu_init();
  },
  // 获取需求详情（编辑用）
  mydetail(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/mydetail', post, (res) => {
      app.format_img(res, 'avatar');
      this.setData({
        nickname: res.nickname || '',
        realname: res.realname || '',
        sex: res.sex - 1,
        age: res.age,
        tel: res.tel || '',
        sign: res.sign || '',
        avatar: res.avatar
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 选择性别
  sex_change(e) {
    let sex = this.data.sex_data[e.detail.value].value;
    app.ajax('my/modSex', { sex }, () => {
      this.mydetail();
    });
  },
  img_upload(e) {
    app.choose_img(1, res => {
      if (res) {
        wx.showLoading({ mask: true });

        let tname = app.qiniu_tname() + res[0].ext;
        app.qiniu_upload(res[0].path, tname, () => {
          app.ajax('my/modAvatar', { avatar: tname }, () => {
            this.mydetail();
          }, null, () => {
            wx.hideLoading();
          });
        }, null, () => {
          wx.hideLoading();
        });
      }
    }, 1048576);
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
  },
  to_edit(e) {
    let field_name = e.currentTarget.dataset.name;
    wx.navigateTo({ url: '/pages/my-edit-detail/my-edit-detail?field_name=' + field_name + '&value=' + encodeURIComponent(this.data[field_name]) });
  }
});