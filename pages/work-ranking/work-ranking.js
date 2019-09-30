const app = getApp();

Page({
  data: {
    page: 1,
    work_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.worksList();
  },
  // 作品排行
  worksList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10,
      order: 2  // 按投票
    };

    app.ajax('api/worksList', post, res => {
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
        app.avatar_format(res, 'avatar');
        app.format_img(res, 'cover');
        for (let i = 0; i < res.length; i++) {
          app.format_img(res[i].pics);
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
      this.worksList(() => {
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
        this.worksList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 作品投票
  worksVote(e) {
    let index = e.currentTarget.dataset.index;
    let work = this.data.work_list[index];
    if (!work.if_vote) {
      if (!this.data.loading) {
        wx.showModal({
          title: '提示',
          content: '确定投票？',
          success: res => {
            if (res.confirm) {
              this.data.loading = true;
              app.ajax('api/worksVote', { work_id: work.id }, res => {
                if (res) {
                  work.if_vote = true;
                  work.vote++;
                  this.setData({ [`work_list[${index}]`]: work });
                }
              }, null, () => {
                this.data.loading = false;
              });
            }
          }
        });
      }
    } else {
      app.toast('您已投票给该作品');
    }
  }
});