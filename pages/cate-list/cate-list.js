const app = getApp();

Page({
  data: {
    full_loading: true,

    active_index: 0,
    cate_list: [],  // 商品分类
    video_list: [],  // 视频列表

    ip_cate_list: [],  // 版权分类
    ip_pad: [],

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad() {
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 商品分类
    let promise1 = new Promise(resolve => {
      this.cateList(() => {
        resolve();
      });
    });

    // 视频列表
    let promise2 = new Promise(resolve => {
      this.videoList(() => {
        resolve();
      });
    });

    // 版权分类
    let promise3 = new Promise(resolve => {
      this.ipCateList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  tab_change(e) {
    this.setData({ active_index: e.currentTarget.dataset.index });
  },
  // 商品分类
  cateList(complete) {
    app.ajax('cate/goodsCateList', null, (res) => {
      app.format_img(res, 'icon');
      for (let i = 0; i < res.length; i++) {
        app.format_img(res[i].child, 'icon');
      }

      res.unshift(
        {
          id: -2,
          cate_name: '热门推荐'
        },
        {
          id: -1,
          cate_name: 'IP授权'
        }
      );
      this.setData({ cate_list: res })
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 视频列表
  videoList(complete) {
    app.ajax('cate/videoList', null, res => {
      app.format_img(res, 'poster');
      app.format_img(res, 'video_url');
      this.setData({ video_list: res });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 版权分类
  ipCateList(complete) {
    app.ajax('copyright/ipCateList', null, res => {
      app.format_img(res, 'icon');
      res = res.filter(cate => {
        return cate.recommend === 1
      });

      this.setData({
        ip_cate_list: res,
        ip_pad: app.null_arr(res.length, 2)
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 去特定类目商品页
  to_cate_shop(e) {
    let cate = e.currentTarget.dataset.cate;
    wx.navigateTo({ url: '/pages/cate-shop/cate-shop?id=' + cate.id + '&cate_name=' + encodeURI(cate.cate_name) });
  },
  // 跳页
  jump(e) {
    app.check_bind(() => {
      let url = e.currentTarget.dataset.url;
      wx.navigateTo({ url });
    });
  }
});