const app = getApp();

Page({
  data: {
    my_uid: 0,
    my_avatar: '',

    content: '',
    xuqiu_id: 0,
    xuqiu: {},
    release_focus: false,
    input_bottom: 0,

    comment_list: [],

    focus: false,  // 是否关注
    focus_loading: false
  },
  onLoad(options) {
    this.data.xuqiu_id = options.id;
    this.setData({
      my_uid: app.user_data.uid,
      my_avatar: app.user_data.avatar
    });
    this.xuqiuDetail();
    this.commentList();
  },
  xuqiuDetail(callback) {
    app.ajax('xuqiu/xuqiuDetail', { xuqiu_id: this.data.xuqiu_id }, (res) => {
      app.avatar_format(res);
      app.avatar_format(res.comment_list);
      app.format_img(res.pics);
      switch (res.role) {
        case 1:
          res.role_text = '博物馆';
          break;
        case 2:
          res.role_text = '设计师';
          break;
        case 3:
          res.role_text = '工厂';
          break;
      }
      app.ago_format(res, 'create_time');
      app.ago_format(res.comment_list, 'create_time');
      for (let i = 0; i < res.comment_list.length; i++) {
        switch (res.comment_list[i].role) {
          case 1:
            res.comment_list[i].role_text = '博物馆';
            break;
          case 2:
            res.comment_list[i].role_text = '设计师';
            break;
          case 3:
            res.comment_list[i].role_text = '工厂';
            break;
        }
      }

      this.setData({ xuqiu: res });
      if (callback) {
        callback();
      }
    });
  },
  bind_focus(e) {
    this.setData({ input_bottom: e.detail.height });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  show_input() {
    this.setData({ release_focus: true });
  },
  hide_input() {
    this.setData({ release_focus: false });
  },
  commentAdd() {
    if (this.data.content.trim()) {
      wx.showLoading({ mask: true });

      let post = {
        xuqiu_id: this.data.xuqiu_id,
        content: this.data.content
      };

      app.ajax('xuqiu/commentAdd', post, () => {
        app.toast('评论已发表');
        this.setData({ content: '' });
        this.commentList();
      });
    }
  },
  // 去他人主页
  to_person(e) {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?tel=1&uid=' + e.currentTarget.dataset.uid });
    });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  // 预览图片
  preview(e) {
    wx.previewImage({
      current: this.data.xuqiu.pics[e.currentTarget.dataset.index],
      urls: this.data.xuqiu.pics
    });
  },
  // 需求评论列表
  commentList() {
    let post = {
      xuqiu_id: this.data.xuqiu_id
    };

    app.ajax('xuqiu/commentList', post, res => {
      app.avatar_format(res);
      app.ago_format(res, 'create_time');
      this.setData({ comment_list: res });
    });
  }
});