<template>
	<section class="siteIndex">
		<p id="downloadTip" class="download-tip" :class="{show:showTip}">
			<span v-if="newsNum==0">已是最新内容</span>
			<span v-else>有{{newsNum}}条新内容</span>
		</p>
		<!--滑动区域-->
		<mescroll-vue ref="mescroll" :up="mescrollUp"  :down="mescrollDown" @init="mescrollInit">
			<!--模拟的内容-->
			<section class="slideWrapper">
				<!--<swiper :options="swiperOption" ref="mySwiper">
					<swiper-slide><img src="../assets/banner.png" /></swiper-slide>
					<div class="swiper-pagination" slot="pagination"></div>
				</swiper>-->
				<div class="banner">
				    <router-link to=""><img src="../assets/banner.png"/></router-link>
				</div>
			</section>
			<!--展示上拉加载的数据列表-->
			<section class="section1">
				<div class="hd">
				    搜罗
				</div>
				<div class="bd">
					<router-link v-for="(item,index) in dataList" :key="index" :id="index" tag="div" class="item flex" :to="{path:'/article/'+item.id}">
						<div class="info">
							<h2 class="title" v-html="item.title"></h2>
							<div class="flex">
								<div>
									<span class="hot" v-if="item.isHot">置顶</span>
									<span class="type">{{item.category}}</span>
								</div>
								<span class="collectNum">浏览量{{item.hits}}</span>
							</div>
						</div>
						<div class="img-responsive">
							<img v-if="item.image" onclick="return false;" :src="isMyPic(item.image)" />
							<img v-else onclick="return false;" src="../../static/nopic.png" />
						</div>
					</router-link>
				</div>
			</section>
		</mescroll-vue>
	</section>
</template>

<script>
	import 'swiper/dist/css/swiper.css'
	import { swiper, swiperSlide } from 'vue-awesome-swiper'
	import MescrollVue from 'mescroll.js/mescroll.vue'
	import axios from '../utils/fetch'
	import wxShare from '@/utils/wxshare'

	export default {
		components: {
			swiper,
			swiperSlide,
			MescrollVue
		},
		data() {
			return {
				swiperOption: {
					pagination: {
						el: '.swiper-pagination'
					},
					autoplay: {
						delay: 3000,
						disableOnInteraction: false
					},
					speed: 450,

				},
				mescroll: null, // mescroll实例对象
				mescrollDown: {
					callback: this.downCallback,
					auto:false
				},
				mescrollUp: { // 上拉加载的配置.
					callback: this.upCallback, // 上拉回调,此处简写; 相当于 callback: function(page, mescroll) { }
					//以下是一些常用的配置,当然不写也可以的.
					page: {
						num: 0, //当前页 默认0,回调之前会加1; 即callback(page)会从1开始
						size: 10 //每页数据条数,默认10
					},
					htmlNodata: '<p class="upwarp-nodata">我也是有底线的</p>',
					noMoreSize: 5, //如果列表已无数据,可设置列表的总数量要大于5才显示无更多数据;
					toTop: {
						//回到顶部按钮
						src: "./static/mescroll-totop.png", //图片路径,默认null,支持网络图
						offset: 1000 //列表滚动1000px才显示回到顶部按钮
					}
					
				},
				dataList:[],
				lastTime:0,
				showTip:false,
				newsNum:0
			}
		},
		computed: {
			swiper() {
				return this.$refs.mySwiper.swiper
			},
			isMyPic(v){
				return function(v){
					return v.match(/^http/)?v:'域名（相对路径改绝对路径）'+v;
				}
			}
		},
		mounted:function(){
				wxShare({
					title: '网站名称',
					link: window.location.href,
					imgUrl: '',
					desc: '网站介绍'
				})
		},
		methods: {
			mescrollInit(mescroll) {
				this.mescroll = mescroll
			},
			// 上拉加载
			upCallback(page, mescroll) {
//				console.log('加载')
				let data;
				//区分首次加载和多次加载
				if(page.num===1){
					data={
						offset: (page.num-1)*page.size+1,
						limit: page.size,
						lastTime:this.lastTime
					}
				}else{
					data={
						offset: (page.num-1)*page.size+1,
						limit: page.size 
					}
				}
				this.$axios.get('/api/article/recommend', {params: data})
					.then((response) => {
					// 请求的列表数据
					let list = response.data.list;
					// 如果是第一页需手动制空列表
					if(page.num===1) {
						this.dataList=[];	
						this.lastTime = response.data.lastTime;
					}
					this.dataList = this.dataList.concat(list)
					// 数据渲染成功后,隐藏下拉刷新的状态
					this.$nextTick(() => {
						this.mescroll.endSuccess(list.length)
					})
				}).catch((e) => {
					// 联网失败的回调,隐藏下拉刷新和上拉加载的状态;
					this.mescroll.endErr()
				})	
			},
			downCallback(page, mescroll) {
//				console.log('刷新')
				this.$axios.get('/api/article/recommend', {
						params: {
							limit: 0,
						    offset:0,
							lastTime:this.lastTime
						}
					})
					.then((response) => {
						// 请求的列表数据
						let list = response.data.list;
						// 把请求到的数据添加到列表
						this.newsNum = list.length;
						this.lastTime = response.data.lastTime;
				        if(list.length){
				        	for(let i=this.newsNum;i>0;i--){
					        	this.dataList.unshift(list[i-1])
					        }
				        }
//				        console.log(this.dataList)
						// 数据渲染成功后,隐藏下拉刷新的状态
						this.$nextTick(() => {
							this.showTip = true;
				        	setTimeout(()=>{
				        		this.showTip=false;
				        	},1000);
				        	this.mescroll.endSuccess()
						})
					})
					.catch((e) => {
						// 联网失败的回调,隐藏下拉刷新和上拉加载的状态;
						this.mescroll.endErr()
					})	
			}
		},
		beforeRouteEnter(to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteEnter不用写
			next(vm => {
				vm.$refs.mescroll.beforeRouteEnter() // 进入路由时,滚动到原来的列表位置,恢复回到顶部按钮和isBounce的配置
				})
			},
		beforeRouteLeave(to, from, next) { // 如果没有配置回到顶部按钮或isBounce,则beforeRouteLeave不用写
			this.$refs.mescroll.beforeRouteLeave() // 退出路由时,记录列表滚动的位置,隐藏回到顶部按钮和isBounce的配置
			next()
		}
		
	}
</script>

<style scope lang="less">
	/*以fixed的方式固定mescroll的高度*/
	
	.mescroll .notice { font-size: 14px; padding: 20px 0; border-bottom: 1px solid #eee; text-align: center; color: #555;}
	
	@af: 7.5vw;
	.siteIndex {background: #fff !important;}
	.slideWrapper{background: #fafafa;}
	.slideWrapper .banner{padding: 30/@af;}
	.swiper-pagination-bullet {width: 12px;height: 4px;border-radius: 0;background: #666;}
	.swiper-pagination-bullet-active {background: #C43026;}
	
	.swiper-slide { width: auto; }
	.mescroll { position: absolute; top: 0; bottom: 0; height: auto;}
	.mescroll-upwarp,
	.nodata{background: #eee;color: #333;
		img{max-width: 160/@af;}
		h3{font-size: 32/@af;line-height: 2;}
		h5{font-size: 24/@af;padding-bottom: 20/@af;font-weight: normal;}
	}
	#downloadTip.show{opacity: 1;z-index: 999;}
	#downloadTip{opacity: 0; transition: all .3s ease;  position: fixed;left: 0;right: 0;margin: auto;text-align: center; top: 15%;z-index: -1; }
	#downloadTip span{background: rgba(0,0,0,0.6);border-radius: 20px; color: #fff;padding: 6px 20px;display: inline-block;}
</style>