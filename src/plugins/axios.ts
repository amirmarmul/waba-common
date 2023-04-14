import axiosModule from 'axios';
import curlirizeModule from 'axios-curlirize';
curlirizeModule(axiosModule);
export const axios = axiosModule({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
export default axios;
