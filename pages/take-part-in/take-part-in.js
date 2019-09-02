const app = getApp()

Page({
  data: {
    req_id: 0,  // 赛事id
    req_title: '',  // 赛事标题
    pics: '',  // 作品图片
    title: '',  // 作品标题
    desc: '',  // 作品描述
    plat: ''
  },
  onLoad: function (options) {
    this.data.req_id = options.req_id;
    this.setData({req_title: decodeURI(options.req_title)});

    let phone = wx.getSystemInfoSync();
    this.setData({plat: phone.platform});
  },
  // 删除照片 &&
  imgDelete1: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let pics = this.data.pics;
    pics.splice(index, 1)
    that.setData({ pics: pics });
  },
  // 上传图片 &&&
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
            url: app.my_config.api + 'api/uploadImage2m',
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
                pics: pics
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
  // 参赛提交
  uploadWorks() {
    if (!this.data.title.trim()) {
      app.toast('请填写作品标题');
    } else if (!this.data.desc.trim()) {
      app.toast('请填写作品内容');
    } else if (this.data.pics.length === 0) {
      app.toast('请至少上传一张图片');
    } else {
      let post = {
        token: app.user_data.token,
        req_id: this.data.req_id,
        title: this.data.title,
        desc: this.data.desc,
        pics: this.get_img_arr()
      };
      
      app.ajax(app.my_config.api + 'api/uploadWorks', post, (res) => {
        app.modal('作品已提交', () => {
          wx.navigateTo({ url: '/pages/vote-list/vote-list?req_id=' + this.data.req_id + '&origin=1' });
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