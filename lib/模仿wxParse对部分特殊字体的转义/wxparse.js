// 解析特殊字符实体
var tohtml = function (str) {
  // 加入常用解析
  str = change('&nbsp;', ' ', str);
  str = change('&ldquo;', '“',str);
  str = change('&rdquo;', '”', str);
  str = change('&hellip;', '...', str);
  str = change('&quot;', "'", str);
  str = change('&amp;', "&", str);
  str = change('&lt;', "<", str);
  str = change('&gt;', ">", str);
  str = change('&#8226;', "•", str);
  return str;
}
function change(reg,v,str){
  var regexp = getRegExp(reg, 'g');
  str = str.replace(regexp, v);
  return str;
}
//下面这个格式化时间跟本文件没关联，可以删除
// 格式化时间
var formatNumber = function (n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var regYear = getRegExp("(y+)", "i");

var formatTime = function (timestamp, format) {
  if (!format) {
    format = "yyyy-MM-dd";
  }
  timestamp = parseInt(timestamp);
  var realDate = getDate(timestamp);
  function timeFormat(num) {
    return num < 10 ? '0' + num : num;
  }
  var date = [
    ["M+", timeFormat(realDate.getMonth() + 1)],
    ["d+", timeFormat(realDate.getDate())],
    ["h+", timeFormat(realDate.getHours())],
    ["m+", timeFormat(realDate.getMinutes())],
    ["s+", timeFormat(realDate.getSeconds())],
    ["q+", Math.floor((realDate.getMonth() + 3) / 3)],
    ["S+", realDate.getMilliseconds()],
   
  ];
  var reg1 = regYear.exec(format);
  if (reg1) {

    format = format.replace(reg1[1], (realDate.getFullYear() + '').substring(4 - reg1[1].length));
  }
  for (var i = 0; i < date.length; i++) {
    var k = date[i][0];
    var v = date[i][1];

    var reg2 = getRegExp("(" + k + ")").exec(format);
    if (reg2) {
      format = format.replace(reg2[1], reg2[1].length == 1
        ? v : ("00" + v).substring(("" + v).length));
    }
  }
  return format;
}

module.exports = {
  tohtml: tohtml,
  formatTime: formatTime
}
/*使用方法：在要转义数据的页面引入文件<wxs src="../../utils/filter.wxs" module="filter" />（注意：这个文件的真正格式为.wxs，请自行查询相关资料）
<view class="h1"> {{filter.tohtml("&nbsp;&gt;测试数据&lt;&quot;")}} </view>（要转义的数据，其实跟vue的filter过滤器很像）*/
