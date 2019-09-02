const app = getApp()
const utils = require('../../utils/utils.js');

Page({
  data: {
    textarea_padding: '15rpx',

    // 字段名
    title: '',  // 赛事名称
    org: '',  // 主办单位
    explain: '',  // 赛事说明
    theme: '',  // 征集主题
    cover: '',  // 赛事图片
    linkman: '',  // 联系人phone
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

    now_date: utils.date_format('yyyy-MM-dd', new Date()),
    now_time: utils.date_format('hh:mm', new Date())
  },
  onLoad: function () {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    // 下面的备用

    // let now_date = utils.date_format('yyyy-MM-dd', new Date());
    // let now_time = utils.date_format('hh:mm', new Date());

    // this.setData({
    //   start_time_date: now_date,
    //   start_time_time: now_time,
    //   deadline_date: now_date,
    //   deadline_time: now_time,
    //   vote_time_date: now_date,
    //   vote_time_time: now_time,
    //   end_time_date: now_date,
    //   end_time_time: now_time
    // });
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

        app.ajax(app.my_config.api + 'my/reqRelease', post, () => {
          this.setData({ release_loading: false });
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000
          });
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 2000)
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
            url: app.my_config.api + 'api/uploadImage2m',
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
            url: app.my_config.api + 'api/uploadImage2m',
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