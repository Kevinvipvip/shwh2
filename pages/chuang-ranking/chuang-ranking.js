const app = getApp();

Page({
  data: {
    page: 1,
    idea_list: [],
    nomore: false,
    nodata: false,
    loading: false
  },
  onLoad() {
    this.ideaList();
  },
  // 创意排行
  ideaList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10,
      order: 2  // 按投票
    };

    app.ajax('api/ideaList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            idea_list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nomore: true,
            nodata: false
          });
        }
      } else {
        app.avatar_format(res, 'avatar');
        for (let i = 0; i < res.length; i++) {
          res[i].flex_pad = app.null_arr(res[i].tags_name.length, 5);
        }

        this.setData({ idea_list: this.data.idea_list.concat(res) });
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
      this.data.idea_list = [];
      this.setData({
        nomore: false,
        nodata: false
      });

      wx.showNavigationBarLoading();
      this.ideaList(() => {
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
        this.ideaList(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 创意投票
  ideaVote(e) {
    let index = e.currentTarget.dataset.index;
    let idea = this.data.idea_list[index];
    if (!idea.if_vote) {
      if (!this.data.loading) {
        this.data.loading = true;
        app.ajax('api/ideaVote', { idea_id: idea.id }, res => {
          if (res) {
            idea.if_vote = true;
            idea.vote++;
            this.setData({ [`idea_list[${index}]`]: idea });
          }
        }, null, () => {
          this.data.loading = false;
        });
      }
    } else {
      app.toast('您已为该创意点赞');
    }
  }
});