const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',

    req_id: 0,  // 活动id
    title: '',  // 作品标题
    desc: '',  // 作品描述
    desc_count: 0,
    pics: [],  // 作品图片
    flex_pad: [],

    idea_id: 0,  // 创意id（选填）
    idea: {}
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    this.data.req_id = options.req_id;

    if (options.idea_id) {
      this.setData({idea_id: options.idea_id});
      this.ideaDetail();
    }

    app.qiniu_init();
  },
  // 删除照片
  img_delete(e) {
    let index = e.currentTarget.dataset.index;
    let pics = this.data.pics;
    pics.splice(index, 1);
    this.setData({
      pics: pics,
      flex_pad: app.null_arr(pics.length + 1, 3)
    });
  },
  // 上传图片
  up_pics() {
    app.choose_img(9 - this.data.pics.length, res => {
      let up_succ = 0;

      wx.showLoading({
        title: '上传中',
        mask: true
      });

      for (let i = 0; i < res.length; i++) {
        let tname = app.qiniu_tname() + res[i].ext;
        app.qiniu_upload(res[i].path, tname, () => {
          this.data.pics.push(app.format_img(tname));
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
    }, 1048576);
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'desc') {
      this.setData({desc_count: this.data.desc.length});
    }
  },
  // 上传作品
  uploadWorks() {
    let data = this.data;
    if (!data.title.trim()) {
      app.toast('请输入作品名称');
    } else if (!data.desc.trim()) {
      app.toast('请输入作品简述');
    } else if (data.pics.length === 0) {
      app.toast('请上传租作品图片');
    } else {
      app.format_up_img(data.pics);

      let post = {
        req_id: data.req_id,
        title: data.title,
        desc: data.desc,
        pics: data.pics
      };

      if (data.idea_id !== 0) {
        post.idea_id = data.idea_id;
      }

      wx.showLoading({ mask: true });
      app.ajax('api/uploadWorks', post, () => {
        wx.redirectTo({ url: '/pages/my-works/my-works' });
      }, null, () => {
        wx.hideLoading();
      });
    }
  },
  // 创意详情
  ideaDetail() {
    app.ajax('api/ideaDetail', {idea_id: this.data.idea_id}, res => {
      this.setData({idea: res});
    });
  }
});