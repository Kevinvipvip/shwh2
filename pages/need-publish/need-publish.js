const app = getApp();

Page({
  data: {
    id: 0,
    is_ios: false,

    title: '',  // 需求标题
    content: '',  // 需求内容
    content_count: 0,
    pics: [],
    reason: '',

    status: 0  // 0.审核中 1.通过审核 2.未通过 （编辑需求时用）
  },
  onLoad(options) {
    this.setData({ full_loading: false });

    if (options.id) {
      this.setData({ id: options.id });
      this.xuqiuDetail();
    }

    app.qiniu_init();
  },
  // 需求详情
  xuqiuDetail() {
    app.ajax('xuqiu/xuqiuDetail', { xuqiu_id: this.data.id }, res => {
      app.format_img(res.pics);
      let pics = [];
      for (let i = 0; i < res.pics.length; i++) {
        pics.push({ pic: res.pics[i] });
      }

      this.setData({
        title: res.title,
        content: res.content,
        content_count: res.content.length,
        pics: pics,
        reason: res.reason,
        status: res.status
      });
    });
  },
  // 删除图片
  img_delete(e) {
    let that = this;
    let index = e.currentTarget.dataset.deindex;
    let pics = this.data.pics;
    pics.splice(index, 1);
    that.setData({ pics: pics });
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
            this.data.pics.push({ pic: app.format_img(tname) });
            this.setData({ pics: this.data.pics });
            up_succ++;

            if (up_succ === res.length) {
              wx.hideLoading();
            }
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    }, 262144);
  },
  img_load(e) {
    this.setData({
      ['pics[' + e.currentTarget.dataset.index + '].width']: e.detail.width,
      ['pics[' + e.currentTarget.dataset.index + '].height']: e.detail.height
    });
  },
  // 发布/编辑需求
  needRelease(e) {
    let data = this.data;

    if (!data.title.trim()) {
      app.toast('请填写需求标题');
    } else if (!data.content.trim()) {
      app.toast('请填写需求内容');
    } else {
      app.collectFormid(e.detail.formId);

      let pics = this.get_img_arr();

      let post = {
        title: data.title,
        content: data.content,
        token: app.user_data.token
      };

      if (pics.length > 0) {
        post.pics = pics;
        post.width = data.pics[0].width;
        post.height = data.pics[0].height;
      }

      let cmd;
      if (data.id !== 0) {
        post.id = this.data.id;
        cmd = 'xuqiu/xuqiuMod';
      } else {
        cmd = 'xuqiu/xuqiuAdd';
      }

      wx.showLoading({ mask: true });
      app.ajax(cmd, post, () => {
        if (data.id !== 0) {
          app.modal('修改成功', () => {
            let notes = app.get_page('pages/my-needs/my-needs');
            if (notes) {
              notes.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-needs/my-needs' });
            }
          });
        } else {
          app.modal('发布成功，将进入审核，请耐心等待', () => {
            let needs = app.get_page('pages/my-needs/my-needs');
            if (needs) {
              needs.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-needs/my-needs' });
            }
          });
        }
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
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
      this.setData({ content_count: this.data.content.length });
    }
  }
});