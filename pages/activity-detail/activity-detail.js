const app = getApp();

Page({
  data: {
    id: 0,
    req: {},
    active_tab: 1,

    // 创意
    chuang_page: 1,
    chuang_nomore: false,
    chuang_nodata: true,
    chuang_sort: 1,  // 1.时间 2.热度

    // 作品

    // 众筹
    chou_nomore: false,
    chou_nodata: true,
  },
  onLoad(options) {
    this.setData({id: options.id});
    this.getReqDetail();
  },
  // 获取活动详情
  getReqDetail() {
    app.ajax('api/getReqDetail', {id: this.data.id}, (res) => {
      app.format_img(res, 'cover');
      app.avatar_format(res);
      app.time_format(res, 'start_time');
      app.time_format(res, 'deadline');
      app.time_format(res, 'vote_time');
      app.time_format(res, 'end_time');

      this.setData({req: res});
    });
  },
  // 切换tab
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  },
  // 创意列表
  ideaList() {
    let post = {
      page: chuang_page,
      perpage: 10
    };

    app.ajax('api/ideaList', post, res => {
      app.avatar_format(res, 'avatar');

      this.setData({idea_list: res});
    });
  }
});