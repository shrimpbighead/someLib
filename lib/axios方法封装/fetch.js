import axios from 'axios'
import qs from 'qs'
import { Cookie } from '@/utils/storage'
 //axios跨域使用formdata
 
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.withCredentials = true ;
axios.defaults.timeout = '6000';
// 请求拦截器
axios.interceptors.request.use(function(config) {
	let token = Cookie.get('token');
	if(token){
		config.headers.Authorization = token;//将token放到请求头发送给服务器
	}
    return config;
 }, function(error) {
    return Promise.reject(error);
  })
  // 响应拦截器
axios.interceptors.response.use(function(response) {
  return response;
}, function(error) {
  return Promise.reject(error);
})
 
// 封装axios的post请求


export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, params)
      .then(response => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      })
  })
}
export function post(url, data) {
  return new Promise((resolve, reject) => {
    axios.post(url, qs.stringify(data))
    .then(res => {
      resolve(res.data)
    }).catch(err => {
    	console.log('error')
      reject(err)
    })
  })
} 

 
export default {
  get(url, params) {
    return get(url, params);
  },
  post(url, params) {
    return post(url, params);
  }
}

