const app = getApp()

Page({
  data: {
    id: 0,
    imgbox: [],
    title: '',
    content: '',
    status: 0,
    reason: '',
    plat: ''
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    this.setData({plat: phone.platform});

    this.data.id = options.id;
    this.getMyNoteDetail();
  },
  // 获取我的笔记详情
  getMyNoteDetail() {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax(app.my_config.api + 'my/getMyNoteDetail', post, (res) => {
      for (let i = 0; i < res.pics.length; i++) {
        res.pics[i] = app.my_config.base_url + '/' + res.pics[i];
      }
      this.setData({
        title: res.title,
        content: res.content,
        imgbox: res.pics,
        status: res.status,
        reason: res.reason
      });
    });
  },
  // 删除照片 &&
  imgDelete1: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let imgbox = this.data.imgbox;
    imgbox.splice(index, 1)
    that.setData({
      imgbox: imgbox
    });
  },
  // 上传图片 &&&
  addPic1: function (e) {
    var that = this;
    wx.chooseImage({
      count: 9 - this.data.imgbox.length,
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.upload_images(res.tempFiles, 0);
      }
    })
  },
  upload_images(images, index) {
    let that = this;

    if (index !== images.length) {
      if (index === 0) {
        wx.showLoading({
          title: '上传中',
          mask: true
        });
      }

      if (images[index].size > 524288) {
        app.toast('上传的图片不能大于512K');
        index++;
        that.upload_images(images, index);
      } else {
        wx.uploadFile({
          url: app.my_config.api + 'api/uploadImage',
          filePath: images[index].path,
          name: 'file',
          formData: {
            token: app.user_data.token
          },
          success(res) {
            res = JSON.parse(res.data);
            that.data.imgbox.push(app.my_config.base_url + '/' + res.data.path);
            that.setData({ imgbox: that.data.imgbox });
          },
          fail() {
            app.toast('上传失败');
          },
          complete() {
            index++;
            that.upload_images(images, index);
          }
        })
      }
    } else {
      wx.hideLoading();
    }
  },
  noteMod() {
    if (!this.data.title.trim()) {
      app.toast('请填写笔记标题');
    } else if (!this.data.content.trim()) {
      app.toast('请填写笔记内容');
    } else if (this.data.imgbox.length === 0) {
      app.toast('请至少上传一张图片');
    } else {
      let post = {
        id: this.data.id,
        title: this.data.title,
        content: this.data.content,
        token: app.user_data.token,
        pics: this.get_img_arr()
      };

      app.ajax(app.my_config.api + 'my/noteMod', post, () => {
        app.modal('已提交修改，将进入审核，请耐心等待', () => {
          let notes = app.get_page('pages/my-notes/my-notes');
          if (notes) {
            notes.refresh(() => {
              wx.navigateBack({ delta: 1 })
            });
          } else {
            wx.navigateBack({ delta: 1 })
          }
        });
      });
    }
  },
  get_img_arr() {
    var img_arr = [];
    for (let i = 0; i < this.data.imgbox.length; i++) {
      img_arr.push(this.data.imgbox[i].replace(app.my_config.base_url + '/', ''));
    }
    return img_arr;
  },
  // common start
  bind_input: function (e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  }
})