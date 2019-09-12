const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',

    title: '',  // 笔记标题
    content: '',  // 笔记内容
    content_count: 0,
    pics: [],

    flex_pad: []
  },
  onLoad() {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    app.qiniu_init();
  },
  // 删除图片
  img_delete(e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let pics = this.data.pics;
    pics.splice(index, 1);
    that.setData({
      pics: pics
    });
  },
  // 上传图片
  up_pics() {
    app.choose_img(9 - this.data.pics.length, res => {
      if (res) {
        let up_succ = 0;

        wx.showLoading({
          title: '上传中',
          mask: true
        });

        for (let i = 0; i < res.length; i++) {
          let tname = app.qiniu_tname() + res[i].ext;
          app.qiniu_upload(res[i].path, tname, () => {
            this.data.pics.push({pic: app.format_img(tname)});
            this.setData({
              pics: this.data.pics,
              flex_pad: app.null_arr(this.data.pics.length + 1, 3)
            });
            up_succ++;

            if (up_succ === res.length) {
              wx.hideLoading();
            }
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    }, 1048576);
  },
  img_load(e) {
    this.setData({
      ['pics[' + e.currentTarget.dataset.index + '].width']: e.detail.width,
      ['pics[' + e.currentTarget.dataset.index + '].height']: e.detail.height
    });
  },
  noteRelease() {
    let data = this.data;
    
    if (!data.title.trim()) {
      app.toast('请填写笔记标题');
    } else if (!data.content.trim()) {
      app.toast('请填写笔记内容');
    } else if (data.pics.length === 0) {
      app.toast('请至少上传一张图片');
    } else {
      let post = {
        title: data.title,
        content: data.content,
        token: app.user_data.token,
        pics: this.get_img_arr(),
        width: data.pics[0].width,
        height: data.pics[0].height
      };

      app.ajax('note/noteRelease', post, () => {
        app.modal('发布成功，将进入审核，请耐心等待', () => {
          let notes = app.get_page('pages/my-notes/my-notes');
          if (notes) {
            notes.refresh();
            wx.navigateBack({ delta: 1 });
          } else {
            wx.redirectTo({ url: '/pages/my-notes/my-notes' });
          }
        });
      });
    }
  },
  get_img_arr() {
    var img_arr = [];
    for (let i = 0; i < this.data.pics.length; i++) {
      img_arr.push(app.format_up_img(this.data.pics[i].pic));
    }
    return img_arr;
  },
  // common start
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'content') {
      this.setData({content_count: this.data.content.length});
    }
  }
});