const app = getApp();

Page({
  data: {
    user_auth: 0,
    username: '',
    role: 0  // 用户身份
  },
  onLoad() {
    this.setData({
      user_auth: app.user_data.user_auth,
      username: app.user_data.username,
      role: app.user_data.role
    });
  }
});