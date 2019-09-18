const app = getApp();

Page({
  data: {
    note_id: 0,  // 笔记id
    auth_id: 0,  // 作者id
    comment_list: [],  // 评论列表
    re_name: '',  // 回复人昵称
    to_cid: 0,  // 回复评论id
    content: '',
    release_focus: false,
    input_bottom: 0
  },
  onLoad(options) {
    this.data.note_id = options.note_id;
    this.setData({auth_id: options.auth_id});
    this.commentList();
  },
  commentList() {
    let post = {
      token: app.user_data.token,
      note_id: this.data.note_id
    };

    app.ajax('note/commentList', post, (res) => {
      app.avatar_format(res);
      for (let i = 0; i < res.length; i++) {
        app.avatar_format(res[i].child);
      }
      this.setData({comment_list: res});
    });
  },
  bind_focus(e) {
    this.setData({input_bottom: e.detail.height});
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  show_input(e) {
    let re_user = e.currentTarget.dataset.re_user;
    this.data.to_cid = re_user.id
    this.setData({
      re_name: re_user.nickname,
      release_focus: true
    });
  },
  hide_input() {
    this.setData({release_focus: false});
  },
  commentAdd() {
    if (this.data.content.trim()) {
      wx.showLoading({ mask: true });

      let post = {
        token: app.user_data.token,
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
  }
});