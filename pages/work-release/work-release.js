const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',

    req_title: '',  // 赛事标题
    pics: '',  // 作品图片
    title: '',  // 作品标题
    desc: '',  // 作品描述
    plat: '',
    flex_pad: []
  },
  onLoad: function () {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }
  },
  // 删除照片
  imgDelete1: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let pics = this.data.pics;
    pics.splice(index, 1);
    that.setData({
      pics: pics,
      flex_pad: app.null_arr(pics.length + 1, 3)
    });
  },
  // 上传图片
  addPic1: function (e) {
    var pics = this.data.pics;
    var picid = e.currentTarget.dataset.pic;
    var that = this;

    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (res.tempFiles[0].size > 2097152) {
          app.toast('上传的图片不能大于2M');
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: 'api/uploadImage2m',
            filePath: res.tempFiles[0].path,
            name: 'file',
            formData: {
              token: app.user_data.token
            },
            success(res) {
              res = JSON.parse(res.data);

              if (pics.length === 0) {
                pics = [app.my_config.base_url + '/' + res.data.path];
              } else if (9 > pics.length) {
                pics = pics.concat(app.my_config.base_url + '/' + res.data.path);
              } else {
                pics[picid] = app.my_config.base_url + '/' + res.data.path;
              }

              that.setData({
                pics: pics,
                flex_pad: app.null_arr(pics.length + 1, 3)
              });
            },
            fail: function () {
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
  // 上传展示作品
  uploadShowWorks() {
    if (!this.data.title.trim()) {
      app.toast('请填写笔记标题');
    } else if (!this.data.desc.trim()) {
      app.toast('请填写笔记内容');
    } else if (this.data.pics.length === 0) {
      app.toast('请至少上传一张图片');
    } else {
      let post = {
        token: app.user_data.token,
        title: this.data.title,
        desc: this.data.desc,
        pics: this.get_img_arr()
      };
      
      app.ajax('my/uploadShowWorks', post, (res) => {
        app.modal('作品已提交', () => {

          // 刷新并跳转我的作品列表
          let my_works_page = app.get_page('pages/my-works/my-works');
          if (my_works_page) {
            my_works_page.work_release_reload(() => {
              wx.navigateBack({ delta: 1 })
            });
          }
        });
      });
    }
  },
  get_img_arr() {
    var img_arr = [];
    for (let i = 0; i < this.data.pics.length; i++) {
      img_arr.push(this.data.pics[i].replace(app.my_config.base_url + '/', ''));
    }
    return img_arr;
  },
  // common start
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  }
})