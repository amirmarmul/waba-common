import base from 'axios';
import curlirize from 'axios-curlirize';
export const axios = base.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
curlirize(axios);
export default axios;
