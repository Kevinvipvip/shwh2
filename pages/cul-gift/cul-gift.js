const app = getApp()

Page({
  data: {
    full_loading: true,
    cul_gift: {},  // status属性： -1.未集齐 0.未领取 1.已领取
    card_list: [],
    view_cards: [],  // 预览图片列表
    check_seed: 0
  },
  onLoad() {
    this.getMyCul(() => {
      this.setData({full_loading: false})
    });
  },
  onUnload() {
    clearInterval(this.data.check_seed);
  },
  // 卡看片大图
  view_card(e) {
    wx.previewImage({
      current: this.data.view_cards[e.currentTarget.dataset.index],
      urls: this.data.view_cards
    });
  },
  // 用户文创礼品详情
  getMyCul(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax(app.my_config.api + 'Activity/getMyCul', post, (res) => {
      app.format_img(res.cul_gift, 'qrcode');
      app.format_img_arr(res.card_list, 'pic');
      app.format_img_arr(res.card_list, 'pic_back');

      this.setData({
        cul_gift: res.cul_gift,
        card_list: res.card_list
      });

      if (res.cul_gift.status === 0) {
        this.data.check_seed = setInterval(() => {
          this.checkCulStatus();
        }, 1000);
      }

      let view_cards = [];
      for (let i = 0; i < res.card_list.length; i++) {
        view_cards.push(res.card_list[i].pic_back);
      }
      this.setData({view_cards: view_cards});
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 返回文创礼品核销状态
  checkCulStatus() {
    let post = {
      token: app.user_data.token
    };
    app.ajax(app.my_config.api + 'Activity/checkCulStatus', post, (res) => {
      if (res === 1) {
        this.getMyCul();
        clearInterval(this.data.check_seed);
      } else {
        this.setData({'cul_gift.status': res});
      }
    });
  }
})