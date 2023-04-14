import axiosModule from 'axios';
import curlirizeModule from 'axios-curlirize';
curlirizeModule(axiosModule);

export const axios = axiosModule;
export default axios;
