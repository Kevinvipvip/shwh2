const app = getApp();
Page({
	data: {
		loading: false,
		sample_list: [],

		page: 1,
		nomore: false,
		nodata: false,
	},

	onLoad: function (options) {
		this.get_sample_record();
	},
	//获取样品记录列表
	get_sample_record(complete) {
		app.ajax('my/sampleRecord', {
			page: this.data.page,
			perpage: 10
		}, res => {
			if (res.length === 0) {
				if (this.data.page === 1) {
					this.setData({
						order_list: [],
						nodata: true
					});
				} else {
					this.setData({
						nomore: true
					});
				}
			} else {
				app.format_img(res, 'poster');
				app.time_format(res, 'create_time', 'yyyy-MM-dd hh:mm:ss')
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
				nomore: false,
				nodata: false,
				page: 1,
				sample_list: []
			});
			wx.showNavigationBarLoading();

			this.get_sample_record(() => {
				this.data.loading = false;

				wx.hideNavigationBarLoading();

				wx.stopPullDownRefresh();
			});
		}
	},

	//上拉加载更多
	onReachBottom: function () {
		if (!this.data.nomore && !this.data.nodata) {
			if (!this.data.loading) {
				this.data.loading = true;
				wx.showNavigationBarLoading();
				this.get_sample_record(() => {
					wx.hideNavigationBarLoading();
					this.data.loading = false;
				});
			}
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})