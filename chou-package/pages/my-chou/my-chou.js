const app = getApp();

Page({
  data: {
    full_loading: true,
    funding_list: [],
    nomore: false,
    nodata: true
  },
  onLoad() {
    this.fundingList();


    this.setData({ full_loading: false });
  },
  // 众筹列表
  fundingList(complete) {
    let post = {
      page: this.data.page,
      perpage: 10,
      order: 2  // 按投票
    };

    app.ajax('funding/fundingList', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            funding_list: [],
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
        app.format_img(res, 'cover');
        app.qian_format(res, 'curr_money');
        app.qian_format(res, 'need_money');

        this.setData({ funding_list: this.data.funding_list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  }
});