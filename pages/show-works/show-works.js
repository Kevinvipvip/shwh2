const app = getApp();

Page({
  data: {
    status: '',  // 0.审核中 1.通过 2.未通过  空字符串全部
    work_list: [],
    page: 1,
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad(options) {
    if (options.status) {
      this.setData({status: parseInt(options.status)});
    }
    this.getMyShowWorks();
  },
  // 切换tab
  tab_change(e) {
    this.setData({ status: e.currentTarget.dataset.tab });
    this.reset();
    this.getMyShowWorks();
  },
  // 获取我的参赛作品
  getMyShowWorks(complete) {
    let post = {
      status: this.data.status,
      page: this.data.page,
      perpage: 10
    };

    app.ajax('my/getMyShowWorks', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            work_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nomore: true,
            nodata: false
          })
        }
      } else {
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
          switch (res[i].status) {
            case 0:
              res[i].status_text = '审核中';
              break;
            case 1:
              res[i].status_text = '已发布';
              break;
            case 2:
              res[i].status_text = '未通过';
              break;
          }
        }
        this.setData({ work_list: this.data.work_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      this.data.page = 1;
      this.data.work_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.getMyShowWorks(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.getMyShowWorks(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.work_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 去修改作品
  to_modify(e) {
    let work = this.data.work_list[e.currentTarget.dataset.index];
    wx.navigateTo({ url: '/pages/work-release/work-release?id=' + work.id });
  }
});