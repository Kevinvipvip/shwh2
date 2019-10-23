const app = getApp();

Page({
  data: {
    id: 0,
    textarea_padding: '15rpx',

    title: '',  // 作品标题
    desc: '',  // 作品描述
    desc_count: 0,
    pics: [],  // 作品图片
    flex_pad: [],
    reason: ''
  },
  onLoad(options) {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    if (options.id) {
      this.setData({ id: options.id });
      this.showWorksDetail();
      wx.setNavigationBarTitle({ title: '修改展示作品' });
    } else {
      wx.setNavigationBarTitle({ title: '发布展示作品' });
    }

    app.qiniu_init();
  },
  // 作品详情
  showWorksDetail() {
    app.ajax('home/showWorksDetail', {id: this.data.id}, res => {
      app.format_img(res.pics);

      this.setData({
        title: res.title,
        desc: res.desc,
        desc_count: res.desc.length,
        pics: res.pics,
        reason: res.reason,
        flex_pad: app.null_arr(res.pics.length + 1, 3)
      });
    });
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
      if (res) {
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
      }
    }, 262144);
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'desc') {
      this.setData({desc_count: this.data.desc.length});
    }
  },
  // 上传/编辑作品
  uploadShowWorks(e) {
    let data = this.data;
    if (!data.title.trim()) {
      app.toast('请输入作品名称');
    } else if (!data.desc.trim()) {
      app.toast('请输入作品简述');
    } else if (data.pics.length === 0) {
      app.toast('请上传租作品图片');
    } else {
      app.collectFormid(e.detail.formId);

      app.format_up_img(data.pics);

      let post = {
        title: data.title,
        desc: data.desc,
        pics: data.pics
      };

      let cmd;
      if (data.id !== 0) {
        post.work_id = this.data.id;
        cmd = 'my/myShowWorksMod';
      } else {
        cmd = 'my/uploadShowWorks';
      }

      wx.showLoading({ mask: true });
      app.ajax(cmd, post, () => {
        if (data.id !== 0) {
          // 修改
          app.modal('修改成功', () => {
            let page = app.get_page('pages/show-works/show-works');
            page.reset();
            page.setData({status: 0});
            page.getMyShowWorks(() => {
              wx.navigateBack({ delta: 1 });
            });
          });
        } else {
          // 发布
          app.modal('作品发布成功，请等待审核', () => {
            wx.redirectTo({ url: '/pages/show-works/show-works?status=0' });
          });
        }
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  }
});