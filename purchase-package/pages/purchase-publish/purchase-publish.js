const utils = require('../../../utils/utils.js');
const app = getApp();

Page({
  data: {
    full_loading: true,

    now_date: '',

    title: '',  // 采购标题
    min_price: '',  // 最低价
    max_price: '',  // 最高价
    num: '',  // 期望加工量
    deadline: '',  // 交货日期

    invoice: 0,  // 0.需要发票 1.无需发票
    sample: 0,  // 0.有样品 1.无样品
    area: 0,  // 1.全国 2.江浙沪 3.天津

    tel: '',  // 联系方式
    linkman: '',  // 联系人

    desc: '',  // 备注
    pics: [],  // 物品样照
    flex_pad: []
  },
  onLoad() {
    console.log(utils.date_format(new Date(), 'yyyy-MM-dd'));

    this.setData({now_date: utils.date_format(new Date(), 'yyyy-MM-dd')}, () => {
      this.setData({deadline: this.data.now_date})
    });

    app.qiniu_init();
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 日期改变
  bindDateChange(e) {
    this.setData({deadline: e.detail.value});
  },
  // 发票改变
  invoice_change(e) {
    this.setData({invoice: e.currentTarget.dataset.invoice});
  },
  // 样品改变
  sample_change(e) {
    this.setData({sample: e.currentTarget.dataset.sample});
  },
  // 地区改变
  area_change(e) {
    this.setData({area: e.currentTarget.dataset.area});
  },
  // 上传图片
  up_pics() {
    app.choose_img(6 - this.data.pics.length, res => {
      if (res) {
        let up_succ = 0;

        wx.showLoading({
          title: '上传中',
          mask: true
        });

        for (let i = 0; i < res.length; i++) {
          let tname = app.qiniu_tname() + res[i].ext;
          app.qiniu_upload(res[i].path, tname, () => {
            this.data.pics.push({ pic: app.format_img(tname) });
            this.setData({
              pics: this.data.pics,
              flex_pad: app.null_arr(this.data.pics.length + 1, 3)
            });
            up_succ++;

            if (up_succ === res.length) {
              wx.hideLoading();
            }
          }, null, () => {
            wx.hideLoading();
          });
        }
      }
    }, 262144);
  },
  img_load(e) {
    this.setData({
      ['pics[' + e.currentTarget.dataset.index + '].width']: e.detail.width,
      ['pics[' + e.currentTarget.dataset.index + '].height']: e.detail.height
    });
  },
  // 发布需求
  xuqiurelease() {
    let data = this.data;

    if (!data.title.trim()) {
      app.toast('请填写采购标题');
    } else if (!data.min_price) {
      app.toast('请填写预期最低价');
    } else if (!data.max_price) {
      app.toast('请填写预期最高价');
    } else if (data.min_price > data.max_price) {
      app.toast('最高价不能低于最低价');
    } else if (!data.num) {
      app.toast('请填写采购数量');
    } else if (data.pics.length === 0) {
      app.toast('请上传物品样照');
    } else if (!data.tel) {
      app.toast('请填写联系方式');
    } else if (!app.my_config.reg.tel.test(data.tel)) {
      app.toast('请填写正确的联系方式');
    } else if (!data.linkman.trim()) {
      app.toast('请填写联系人');
    }  else {
      let post = {
        title: data.title,
        min_price: data.min_price,
        max_price: data.max_price,
        num: data.num,
        deadline: data.deadline,
        invoice: data.invoice,
        sample: data.sample,
        area: data.area,
        tel: data.tel,
        linkman: data.linkman,
        pics: this.get_img_arr(),
        desc: data.desc,
      };

      wx.showLoading({
        title: '提交中',
        mask: true
      });
      app.ajax('xuqiu/xuqiurelease', post, () => {
        app.modal('提交成功！我们会尽快与您联系', () => {
          wx.navigateBack();
        });
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  },
  get_img_arr() {
    var img_arr = [];
    for (let i = 0; i < this.data.pics.length; i++) {
      img_arr.push(app.format_up_img(this.data.pics[i].pic));
    }
    return img_arr;
  }
});