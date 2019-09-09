const app = getApp();

Page({
  data: {
    activity_list: []
  },
  onLoad() {
    this.activityList();
  },
  // 活动列表
  activityList() {
    let post = {
      token: app.user_data.token
    };

    app.ajax('activity/activityList', post, (res) => {
      app.format_img_arr(res, 'cover');
      this.setData({ activity_list: res })
    });
  },
  // 活动详情（几类不同的活动）
  to_act(e) {
    let act = e.currentTarget.dataset.act;
    switch (act.id) {
      case 1:
        wx.navigateTo({ url: '/pages/invite-list/invite-list' });
        break;
      case 2:
        wx.navigateTo({ url: '/pages/nine-card/nine-card' });
        break;
      case 3:
        break;
    }
  }
})