const app = getApp()

Page({
  data: {
    my_uid: 0,

    note_id: 0,
    note: {},
    input_bottom: 0,

    // 点赞
    like: false,
    like_loading: false,

    // 收藏
    collect: false,
    collect_loading: false,

    focus: false,  // 是否关注
    focus_loading: false,

    auth_id: 0,  // 作者id
    comment_list: [],  // 评论列表
    re_name: '我要评论...',  // 回复人昵称
    to_cid: 0,  // 回复评论id
    content: '',
    release_focus: false
  },
  onLoad(options) {
    this.data.note_id = options.id;
    this.setData({ my_uid: app.user_data.uid });
    this.getNoteDetail(() => {
      this.ifFocus();
    });
    this.ifLike();
    this.ifCollect();
    this.commentList();
  },
  getNoteDetail(callback) {
    let post = {
      token: app.user_data.token,
      note_id: this.data.note_id
    };

    app.ajax('note/getNoteDetail', post, (res) => {
      app.avatar_format(res);
      app.format_img(res.pics);
      // res.avatar = res.avatar.indexOf('https') === 0 ? res.avatar : app.my_config.base_url + '/' + res.avatar;
      // for (let i = 0; i < res.pics.length; i++) {
      //   res.pics[i] = app.my_config.base_url + '/' + res.pics[i];
      // }
      this.setData({ note: res });
      if (callback) {
        callback();
      }
    });
  },
  bind_focus(e) {
    this.setData({ input_bottom: e.detail.height });
  },
  bind_blur() {
    this.setData({ input_bottom: 0 });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  commentAdd() {
    if (this.data.content.trim()) {
      wx.showLoading({ mask: true });

      let post = {
        note_id: this.data.note_id,
        to_cid: this.data.to_cid,
        content: this.data.content
      };

      app.ajax('note/commentAdd', post, () => {
        this.setData({content: ''});
        this.commentList();
      }, null, () => {
        wx.hideLoading();
      });
    }
  },
  // 判断是否点赞
  ifLike() {
    let post = {
      note_id: this.data.note_id,
      token: app.user_data.token
    };

    app.ajax('note/ifLike', post, (res) => {
      this.setData({ like: res });
    });
  },
  // 点赞/取消
  iLike() {
    if (!this.data.like_loading) {
      this.data.like_loading = true;

      let post = {
        note_id: this.data.note_id,
        token: app.user_data.token
      };

      app.ajax('note/iLike', post, (res) => {
        this.setData({
          like: res,
          'note.like': this.data.note.like + (res ? 1 : -1)
        });
      }, null, () => {
        this.data.like_loading = false;
      });
    }
  },
  // 判断是否收藏
  ifCollect() {
    let post = {
      note_id: this.data.note_id,
      token: app.user_data.token
    };

    app.ajax('note/ifCollect', post, (res) => {
      this.setData({ collect: res });
    });
  },
  // 收藏/取消
  iCollect() {
    if (!this.data.collect_loading) {
      this.data.collect_loading = true;

      let post = {
        note_id: this.data.note_id,
        token: app.user_data.token
      };

      app.ajax('note/iCollect', post, (res) => {
        this.setData({ collect: res });
      }, null, () => {
        this.data.collect_loading = false;
      });
    }
  },
  // 判断是否关注
  ifFocus() {
    let post = {
      token: app.user_data.token,
      to_uid: this.data.note.uid
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
        to_uid: this.data.note.uid
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
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.note.uid });
    });
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  commentList() {
    app.ajax('note/commentList', { note_id: this.data.note_id }, (res) => {
      app.avatar_format(res);
      for (let i = 0; i < res.length; i++) {
        app.avatar_format(res[i].child);
      }
      this.setData({ comment_list: res });
    });
  },
  show_input(e) {
    let re_user = e.currentTarget.dataset.re_user;
    this.data.to_cid = re_user.id;
    this.setData({
      re_name: re_user.nickname,
      release_focus: true
    });
  }
});