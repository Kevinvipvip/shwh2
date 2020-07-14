const app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		loading: false,
		sample_list: [],

		page: 1,
		nomore: false,
		nodata: false

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.get_sample_list();
	},
	// 获取样品列表
	get_sample_list(complete) {
		let post = {
			page: this.data.page,
			perpage: 20
		}
		app.ajax('sample/sampleList', post, res => {
			console.log(res);
			if (res.length === 0) {
				if (this.data.page === 1) {
					this.setData({
						sample_list: [],
						nodata: true
					});
				} else {
					this.setData({
						nomore: true
					});
				}
			} else {
				app.format_img(res, 'poster');
				for (let i = 0; i < res.length; i++) {
					this.data.sample_list.push(res[i]);
				}
				this.setData({
					sample_list: this.data.sample_list
				});
			}
			this.data.page++;
		}, null, () => {
			if (complete) {
				complete();
			}
		});
	},

	//下拉刷新
	onPullDownRefresh: function () {
		if (!this.data.loading) {
			this.data.loading = true;

			this.setData({
				page: 1,
				sample_list: [],
				nomore: false,
				nomore: false
			});
			wx.showNavigationBarLoading();
			this.get_sample_list(() => {
				this.data.loading = false;
				wx.hideNavigationBarLoading();
				wx.stopPullDownRefresh();
			})
		}
	},

	//上滑加载更多
	onReachBottom: function () {
		if (!this.data.nodata && !this.data.nomore) {
			if (!this.data.loading) {
				this.data.loading = true;
				wx.showNavigationBarLoading();
				this.get_sample_list(() => {
					wx.hideNavigationBarLoading();
					this.data.loading = false;
				})
			}
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})