const app = getApp();

Page({
  data: {
    full_loading: true,

    id: 0,
    is_ios: false,

    // 用户头像，昵称
    avatar: '',
    nickname: '',

    content: '',  // 笔记内容
    content_count: 0,
    pics: [],
    reason: '',

    status: 0,  // 0.审核中 1.通过审核 2.未通过 （编辑笔记时用）

    c_goods: {},

    flex_pad: []
  },
  onLoad(options) {
    this.setData({
      nickname: app.user_data.nickname,
      avatar: app.user_data.avatar
    });

    if (options.id) {
      this.setData({ id: options.id });
      this.getNoteDetail(() => {
        this.setData({ full_loading: false });
      });
    } else {
      this.setData({ full_loading: false });
    }

    app.qiniu_init();
  },
  // 笔记详情
  getNoteDetail(complete) {
    app.ajax('note/getNoteDetail', { note_id: this.data.id }, res => {
      app.format_img(res.pics);
      let pics = [];
      for (let i = 0; i < res.pics.length; i++) {
        pics.push({ pic: res.pics[i] });
      }

      this.setData({
        content: res.content,
        content_count: res.content.length,
        pics: pics,
        reason: res.reason,
        status: res.status,
        flex_pad: app.null_arr(res.pics.length + 1, 3),
        c_goods: {
          goods_id: res.goods_id,
          goods_name: res.goods_name
        }
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 删除图片
  img_delete(e) {
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
  img_load(e) {
    this.setData({
      ['pics[' + e.currentTarget.dataset.index + '].width']: e.detail.width,
      ['pics[' + e.currentTarget.dataset.index + '].height']: e.detail.height
    });
  },
  // 发布/编辑笔记
  noteRelease(e) {
    let data = this.data;

    if (!data.content.trim()) {
      app.toast('请填写笔记内容');
    } else if (data.pics.length === 0) {
      app.toast('请至少上传一张图片');
    } else if (!data.c_goods.goods_id) {
      app.toast('请选择关联商品');
    } else {
      app.collectFormid(e.detail.formId);

      let post = {
        content: data.content,
        width: data.pics[0].width,
        height: data.pics[0].height,
        pics: this.get_img_arr(),
        goods_id: data.c_goods.goods_id
      };

      let cmd;
      if (data.id !== 0) {
        post.id = this.data.id;
        cmd = 'my/noteMod';
      } else {
        cmd = 'note/noteRelease';
      }

      wx.showLoading({ mask: true });
      app.ajax(cmd, post, () => {
        if (data.id !== 0) {
          app.modal('修改成功', () => {
            let notes = app.get_page('pages/my-notes/my-notes');
            if (notes) {
              notes.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-notes/my-notes' });
            }
          });
        } else {
          app.modal('发布成功，将进入审核，请耐心等待', () => {
            let notes = app.get_page('pages/my-notes/my-notes');
            if (notes) {
              notes.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-notes/my-notes' });
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
  },
  // 去选择商品
  to_choose() {
    if (this.data.c_goods.goods_id) {
      wx.navigateTo({url: '/pages/con-goods/con-goods?goods_id=' + this.data.c_goods.goods_id});
    } else {
      wx.navigateTo({url: '/pages/con-goods/con-goods'});
    }
  },
  // 设置商品（选择商品页调用）
  set_goods(goods) {
    this.setData({ c_goods: goods });
  }
});