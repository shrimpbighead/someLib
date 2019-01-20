export function formatDate(date, fmt) {
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, date.getFullYear());
	}
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds()
	};
	for(let k in o) {
		if(new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + '';
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
		}
	}
	let curTime = new Date().getTime();
	let diffTime = curTime - date;
	if(diffTime < 1000*60) {
		return parseInt(diffTime / (1000)) + '秒前';
	}
	if(diffTime < 1000*60*60) {
		return parseInt(diffTime / (1000 * 60)) + '分钟前';
	}
	if(diffTime < 1000*60*60*6) {
		return parseInt(diffTime / (1000 * 60 * 60)) + '小时前';	
	}
	return fmt;

};

function padLeftZero(str) {
	return('00' + str).substr(str.length);
};