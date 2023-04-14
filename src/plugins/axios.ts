import axiosModule from 'axios';
import curlirizeModule from 'axios-curlirize';
curlirizeModule(axiosModule);

axiosModule.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';
axiosModule.defaults.headers.common['Accept'] = 'application/vnd.api+json';

export const axios = axiosModule;
export default axios;
