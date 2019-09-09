const app = getApp()

Page({
  data: {
    full_loading: true,
    plat: '',

    cover: '',
    desc: '',
    modify_loading: false
  },
  onLoad(options) {
    this.data.id = options.id;

    let phone = wx.getSystemInfoSync();
    this.setData({plat: phone.platform});

    this.applyInfo(() => {
      this.setData({ full_loading: false })
    });
  },
  // 获取申请信息
  applyInfo(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/applyInfo', post, (res) => {
      app.format_img(res, 'cover');
      this.setData({
        cover: res.cover,
        desc: res.desc
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  modMyRole() {
    if (!this.data.modify_loading) {
      let data = this.data;
      if (!data.cover) {
        app.toast('请上传头像');
      } else if (!data.desc.trim()) {
        app.toast('请填写描述');
      } else {
        this.setData({ modify_loading: true });

        let post = {
          token: app.user_data.token,
          desc: data.desc,
          cover: data.cover.replace(app.my_config.base_url + '/', '')
        };

        app.ajax('my/modMyRole', post, () => {
          this.setData({ modify_loading: false });

          app.modal('修改成功', () => {
            wx.navigateBack({ delta: 1 });
          });
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
  img_remove(e) {
    this.setData({ [e.currentTarget.dataset.name]: '' });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  }
});