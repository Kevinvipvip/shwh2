const app = getApp();

Page({
  data: {
    auth: false,
    full_loading: true,
    route: '',
    inviter_id: 0,

    update_dot: '.'
  },
  onLoad(options) {
    if (options.route) {
      this.data.route = decodeURIComponent(options.route);
    } else if (options.q) {
      this.data.route = this.q_format(options.q);
    }

    // this.data.inviter_id = options.scene || 0;
    wx.setStorageSync('inviter_id', options.scene || 0);

    app.login((res) => {
      app.user_data.token = res.token;

      app.redirect_or_switch_or_index(this.data.route);

      // 用户角色信息保存
      app.set_user_data();
    });

    // 升级中
    // setInterval(() => {
    //   let update_dot;
    //   switch (this.data.update_dot) {
    //     case ".":
    //       update_dot = '..';
    //       break;
    //     case "..":
    //       update_dot = '...';
    //       break;
    //     case "...":
    //       update_dot = '....';
    //       break;
    //     case "....":
    //       update_dot = '.';
    //       break;
    //   }
    //   this.setData({update_dot: update_dot});
    // }, 500);
  },
  auth(e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '授权中',
        mask: true
      });

      app.userAuth(this.data.inviter_id, (res) => {
        if (res) {
          app.redirect_or_switch_or_index(this.data.route);
        } else {
          app.toast('授权失败，请重新授权');
        }
      });
    }
  },
  // 格式化通过二维码扫描进来的链接
  q_format(q) {
    q = decodeURIComponent(q);
    q = q.replace('http://caves.wcip.net/', '').split('?');
    let page = q[0], search = q[1];

    return search ? `pages/${page}/${page}?${search}` : `pages/${page}/${page}`;
  }
});