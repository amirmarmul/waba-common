import base from 'axios';
import curlirize from 'axios-curlirize';
export const axios = base.create({
  headers: {
    'Content-Type': 'application/vnd.api+json',
    'Accept': 'application/vnd.api+json',
  }
});
curlirize(axios);
export default axios;
