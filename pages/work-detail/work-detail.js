const app = getApp();

Page({
  data: {
    is_ios: false,

    id: 0,
    work: {},
    loading: false,

    // 接单
    desc: '',
    desc_count: 0,

    // 接单列表
    bidding_list: [],
    choose_bindex: -1,  // 中标工厂index

    uid: 0,
    role: 0  // 用户身份
  },
  onLoad(options) {
    this.setData({ is_ios: app.is_ios });

    this.data.id = options.id;
    this.worksDetail();

    this.setData({ role: app.user_data.role });

    this.setData({ uid: app.user_data.uid });
  },
  worksDetail() {
    app.ajax('activity/worksDetail', { work_id: this.data.id }, res => {
      app.format_img(res.pics);
      app.avatar_format(res);
      app.time_format(res, 'create_time', 'yyyy-MM-dd');

      res.flex_pad = app.null_arr(res.pics.length, 3);

      this.setData({ work: res })
    });
  },
  // 放大图片
  preview(e) {
    wx.previewImage({
      current: this.data.work.pics[e.currentTarget.dataset.index],
      urls: this.data.work.pics
    });
  },
  // 作品投票
  worksVote() {
    let work = this.data.work;
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
                  this.setData({ work });
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
  },
  // 关注/取关
  iFocus() {
    let work = this.data.work;
    if (!this.data.loading) {
      this.data.loading = true;

      app.ajax('note/iFocus', { to_uid: work.uid }, res => {
        this.setData({ ['work.ifocus']: res });
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  bind_input(e) {
    app.bind_input(e, this);
    if (e.currentTarget.dataset.name === 'desc') {
      this.setData({ desc_count: this.data.desc.length });
    }
  },
  // 选择接单工厂
  chooseFactory(e) {
    if (!this.data.loading) {
      app.confirm('确认选择工厂', () => {
        this.data.loading = true;

        let id = e.currentTarget.dataset.id;
        app.ajax('api/chooseFactory', { bidding_id: id }, () => {
          app.modal('已选择工厂');
        });
      });
    }
  },
  // 去他人主页
  to_person(e) {
    app.page_open(() => {
      let uid = e.currentTarget.dataset.uid;
      if (!uid) {
        wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.work.uid });
      } else {
        wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + uid });
      }
    });
  }
});