const app = getApp();

Page({
  data: {
    type: 1,
    nomore: false,
    nodata: true
  },
  onLoad(options) {
    this.data.type = parseInt(options.type);
    this.set_title(this.data.type);
  },
  // 切换tab
  tab_change(e) {
    this.setData({ type: e.currentTarget.dataset.tab }, () => {
      this.set_title(this.data.type);
    });
  },
  // 设置tabbar标题
  set_title(type) {
    switch (type) {
      case 1:
        wx.setNavigationBarTitle({ title: '博物馆列表' });
        break;
      case 2:
        wx.setNavigationBarTitle({ title: '设计师列表' });
        break;
      case 3:
        wx.setNavigationBarTitle({ title: '工厂列表' });
        break;
    }
  }
});