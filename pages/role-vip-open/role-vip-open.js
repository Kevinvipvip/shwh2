const app = getApp();

Page({
  data: {
    role: 0
  },
  onLoad() {
    this.setData({ role: app.user_data.role });
  }
});