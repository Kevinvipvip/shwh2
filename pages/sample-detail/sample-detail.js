const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		id: 0,
		sample: {},
		role: 0,

		apply: {},

		bind_tel_show: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.data.id = options.id;
		this.setData({
			role: app.user_data.role
		});
		console.log(options.id);
		this.sampleDetail()
		this.applyInfo();
	},

	// 样品详情
	sampleDetail() {
		app.ajax('sample/sampleDetail', {
			sample_id: this.data.id
		}, (res) => {
			console.log(res);
			app.format_img(res.pics);
			app.format_img(res, 'poster');
			app.format_img(res, 'video_url');
			app.avatar_format(res);
			this.setData({
				sample: res
			});
			let rich_text = res.detail;
			rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
			WxParse.wxParse('rich_text', 'html', rich_text, this);
		});
	},

	// 进店逛逛
	to_person() {
		app.page_open(() => {
			wx.navigateTo({
				url: '/pages/person-page/person-page?uid=' + this.data.sample.shop_id
			});
		});
	},

	// 立即拿样
	sample_now() {
		console.log('立即拿样');
		app.check_bind(() => {
			let _this = this;
			switch (this.data.role) {
				case 0:
					wx.showModal({
						title: '提示',
						content: '认证成为文旅机构才可拿样',
						confirmText: '去认证',
						success() {
							console.log(_this.data.apply);
							if (_this.data.apply.role_check) {
								wx.navigateTo({
									url: '/pages/apply2/apply2'
								});
							} else {
								wx.navigateTo({
									url: '/pages/apply/apply'
								});
							}
						}
					});
					break;
				case 1:
					let post = {
						sample_id: this.data.id
					}
					app.ajax('sample/sampleTake', post, (res) => {
						console.log(res);
						app.modal('领取成功', () => {
							wx.navigateTo({
								url: '/pages/sample-record/sample-record',
							})
						})
					});
					break;
				case 2:
					wx.showModal({
						title: '提示',
						content: '只有认证成为文旅机构才可拿样，你已认证为工厂',
						showCancel: false,
						success() {
							wx.navigateBack({
								delta: 10
							})
						}
					});
					break;
			}
		})
	},

	// 我的申请信息
	applyInfo(complete) {
		app.ajax('my/applyInfo', null, res => {
			if (!(res instanceof Array)) {
				this.setData({
					apply: res
				});
			}
		}, null, () => {
			if (complete) {
				complete();
			}
		});
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	// 分享
	onShareAppMessage() {
		wx.showShareMenu();
		return {
			path: app.share_path()
		};
	},
})