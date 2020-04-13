const app = getApp();

Page({
  data: {
    full_loading: true,

    type: 1,  // 1.我的关注 2.我的粉丝

    sub_page: 1,
    list: [],  // 关注列表
    nomore: false,
    nodata: false,
    loading: false,
  },
  onLoad(options) {
    this.setData({ type: parseInt(options.type) }, () => {
      let func = this.data.type === 1 ? this.mySubscribeList : this.myFansList;
      func(() => {
        this.setData({ full_loading: false });
      });
    });
  },
  /**
   * 我的关注列表
   * to_uid 是用户的id
   */
  mySubscribeList(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('my/mySubscribeList', post, res => {
      if (res.list.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            list: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nodata: false,
            nomore: true
          });
        }
      } else {
        app.avatar_format(res.list);
        res.list.forEach(user => {
          user.each = res.my_fans_ids.indexOf(user.to_uid) !== -1
        });
        this.setData({ list: this.data.list.concat(res.list) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  /**
   * 我的粉丝列表
   * uid 是用户的id
   */
  myFansList(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('my/myFansList', post, res => {
      if (res.list.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            list: [],
            nodata: true,
            nomore: false
          });
        } else {
          this.setData({
            nodata: false,
            nomore: true
          });
        }
      } else {
        app.avatar_format(res.list);
        res.list.forEach(user => {
          user.each = res.my_sub_ids.indexOf(user.uid) !== -1
        });
        this.setData({ list: this.data.list.concat(res.list) });
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

      wx.showNavigationBarLoading();

      this.reset();
      let func = this.data.type === 1 ? this.mySubscribeList : this.myFansList;

      func(() => {
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

        let func = this.data.type === 1 ? this.mySubscribeList : this.myFansList;

        func(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 关注/取关
  iFocus(e) {
    if (!this.data.loading) {
      let index = e.currentTarget.dataset.index;
      let user = this.data.list[index];

      if (this.data.type === 1) {
        wx.showModal({
          title: '提示',
          content: '确定取消关注？',
          success: res => {
            if (res.confirm) {
              this.data.loading = true;
              app.ajax('note/iFocus', { to_uid: user.to_uid }, () => {
                this.reset();
                this.mySubscribeList();
              }, null, () => {
                this.data.loading = false;
              });
            }
          }
        })
      } else {
        this.data.loading = true;
        app.ajax('note/iFocus', { to_uid: user.uid }, res => {
          user.each = res;
          this.setData({ [`list[${index}].each`]: user.each });
        }, null, () => {
          this.data.loading = false;
        });
      }
    }
  }
});