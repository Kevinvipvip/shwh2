const app = getApp()

Page({
  data: {
    rule: '',
    invite_list: []
  },
  onLoad() {
    this.getInviteList();
  },
  getInviteList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('activity/getInviteList', post, (res) => {
      this.setData({
        rule: res.rule,
        invite_list: res.list
      });
    });
  }
})