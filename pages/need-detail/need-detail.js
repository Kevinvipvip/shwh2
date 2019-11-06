const app = getApp();

Page({
  data: {
    my_uid: 0,

    content: '',
    xuqiu_id: 0,
    note: {},
    release_focus: false,
    input_bottom: 0,

    focus: false,  // 是否关注
    focus_loading: false
  },
  onLoad(options) {
    this.data.xuqiu_id = options.id;
    this.setData({ my_uid: app.user_data.uid });
    this.xuqiuDetail(() => {
      this.ifFocus();
    });
    this.ifCollect();
  },
  xuqiuDetail(callback) {
    app.ajax('xuqiu/xuqiuDetail', { xuqiu_id: this.data.xuqiu_id }, (res) => {
      app.avatar_format(res);
      app.format_img(res.pics);
      this.setData({ need: res });
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
        this.xuqiuDetail();
      });
    }
  },
  // 判断是否关注
  ifFocus() {
    let post = {
      token: app.user_data.token,
      to_uid: this.data.need.uid
    };

    app.ajax('note/ifFocus', post, (res) => {
      this.setData({ focus: res });
    });
  },
  // 关注/取消关注
  iFocus() {
    if (!this.data.focus_loading) {
      this.data.focus_loading = true;

      let post = {
        token: app.user_data.token,
        to_uid: this.data.need.uid
      };

      app.ajax('note/iFocus', post, (res) => {
        this.setData({ focus: res });
      }, null, () => {
        this.data.focus_loading = false;
      });
    }
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.need.uid });
    });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});