const app = getApp()
const utils = require('../../utils/utils.js');

Page({
  data: {
    full_loading: true,
    textarea_padding: '15rpx',

    // 字段名
    id: 0,
    title: '',  // 赛事名称
    org: '',  // 主办单位
    explain: '',  // 赛事说明
    theme: '',  // 征集主题
    cover: '',  // 赛事图片
    linkman: '',  // 联系人
    tel: '',  // 手机号
    phone: '',  // 座机号
    start_time_date: '',  // 活动起始时间
    start_time_time: '',  // 活动起始时间
    deadline_date: '',  // 截止投稿时间
    deadline_time: '',  // 截止投稿时间
    vote_time_date: '',  // 截止投票时间
    vote_time_time: '',  // 截止投票时间
    end_time_date: '',  // 活动结束时间
    end_time_time: '',  // 活动结束时间
    weixin: '',
    release_loading: false,

    status: 0,
    reason: '',

    now_date: utils.date_format(new Date(), 'yyyy-MM-dd'),
    now_time: utils.date_format(new Date(), 'hh:mm')
  },
  onLoad(options) {
    this.data.id = options.id;

    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    this.reqDetail(() => {
      this.setData({full_loading: false})
    });
  },
  // 获取需求详情（编辑用）
  reqDetail(complete) {
    let post = {
      token: app.user_data.token,
      id: this.data.id
    };

    app.ajax('my/reqDetail', post, (res) => {
      app.format_img(res, 'cover');
      this.setData({
        title: res.title,
        org: res.org,
        explain: res.explain,
        theme: res.theme,
        cover: res.cover,
        linkman: res.linkman,
        tel: res.tel,
        phone: res.phone || '',
        start_time_date: res.start_time.substr(0, 10),
        deadline_date: res.deadline.substr(0, 10),
        vote_time_date: res.vote_time.substr(0, 10),
        end_time_date: res.end_time.substr(0, 10),
        weixin: res.weixin,
        status: res.status,
        reason: res.reason
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  apply() {
    if (!this.data.release_loading) {
      let data = this.data;
      if (!data.title.trim()) {
        app.toast('请填写赛事名称');
      } else if (!data.org.trim()) {
        app.toast('请填写主办单位');
      } else if (!data.explain.trim()) {
        app.toast('请填写赛事说明');
      } else if (!data.theme.trim()) {
        app.toast('请填写征集主题');
      } else if (!data.cover) {
        app.toast('请上传赛事图片');
      } else if (!data.linkman.trim()) {
        app.toast('请填写联系人');
      } else if (!data.tel.trim()) {
        app.toast('请填写手机号');
      } else if (!app.my_config.reg.tel.test(data.tel)) {
        app.toast('手机号格式不正确');
      } else if (!data.phone.trim()) {
        app.toast('请填写座机号');
      } else if (!app.my_config.reg.phone.test(data.phone)) {
        app.toast('座机号格式不正确');
        // } else if (!(data.start_time_date && data.start_time_time)) {
      } else if (!data.start_time_date) {
        app.toast('请选择活动起始时间');
        // } else if (!(data.deadline_date && data.deadline_time)) {
      } else if (!data.deadline_date) {
        app.toast('请选择截止投稿时间');
        // } else if (!(data.vote_time_date && data.vote_time_time)) {
      } else if (!data.vote_time_date) {
        app.toast('请选择截止投票时间');
        // } else if (!(data.end_time_date && data.end_time_time)) {
      } else if (!data.end_time_date) {
        app.toast('请选择活动结束时间');
      } else {
        let post = {
          id: this.data.id,
          token: app.user_data.token,
          title: data.title,
          org: data.org,
          explain: data.explain,
          theme: data.theme,
          cover: data.cover.replace(app.my_config.base_url + '/', ''),
          linkman: data.linkman,
          tel: data.tel,
          phone: data.phone,
          weixin: data.weixin,
          // start_time: data.start_time_date + ' ' + data.start_time_date + ':00',
          start_time: data.start_time_date + ' 00:00:00',
          // deadline: data.deadline_date + ' ' + data.deadline_time + ':00',
          deadline: data.deadline_date + ' 00:00:00',
          // vote_time: data.vote_time_date + ' ' + data.vote_time_time + ':00',
          vote_time: data.vote_time_date + ' 00:00:00',
          // end_time: data.end_time_date + ' ' + data.end_time_time + ':00'
          end_time: data.end_time_date + ' 00:00:00'
        };

        app.ajax('my/reqMod', post, () => {
          this.setData({ release_loading: false });

          app.modal('编辑成功，将进入审核，请耐心等待', () => {
            let my_req = app.get_page('pages/my-req/my-req');
            if (my_req) {
              my_req.refresh(() => {
                wx.navigateBack({ delta: 1 });
              });
            } else {
                wx.navigateBack({ delta: 1 });
            }
          });
        });
      }
    }
  },
  // 格式化上传图片路径
  format_up_img(url) {
    return url.replace(app.my_config.base_url + '/', '');
  },
  img_upload(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if (res.tempFiles[0].size > 2097152) {
          app.toast('上传的图片不能大于2M');
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: 'api/uploadImage2m',
            filePath: res.tempFiles[0].path,
            name: 'file',
            formData: {
              token: app.user_data.token
            },
            success(res) {
              res = JSON.parse(res.data);
              that.setData({ [e.currentTarget.dataset.name]: app.my_config.base_url + '/' + res.data.path });
            },
            fail() {
              app.toast('上传失败');
            },
            complete: function () {
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  img_remove(e) {
    this.setData({ [e.currentTarget.dataset.name]: '' });
  },
  work_upload() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success(res) {
        if (res.tempFiles[0].size > 2097152) {
          app.toast('上传的图片不能大于1M');
        } else {
          wx.showLoading({
            title: '上传中',
            mask: true
          });
          wx.uploadFile({
            url: 'api/uploadImage2m',
            filePath: res.tempFiles[0].path,
            name: 'file',
            formData: {
              token: app.user_data.token
            },
            success(res) {
              res = JSON.parse(res.data);
              that.data.works.push(app.my_config.base_url + '/' + res.data.path);

              that.setData({ works: that.data.works });
            },
            fail() {
              app.toast('上传失败');
            },
            complete: function () {
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
  work_remove(e) {
    this.data.works.splice(e.currentTarget.dataset.index, 1);
    this.setData({ works: this.data.works });
  },
  bind_input(e) {
    this.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
  },
  date_time_change(e) {
    this.setData({ [e.currentTarget.dataset.name]: e.detail.value })
  }
});