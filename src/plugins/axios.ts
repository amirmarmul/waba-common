import base from 'axios';
import curlirize from 'axios-curlirize';
curlirize(base);
export const axios = base.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response.data;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});
export default axios;
