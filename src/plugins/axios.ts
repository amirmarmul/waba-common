import axios from 'axios';
import curlirize from 'axios-curlirize';
curlirize(axios);
axios.defaults.headers.common['Content-Type'] = 'application/vnd.api+json';
axios.defaults.headers.common['Accept'] = 'application/vnd.api+json';
export default axios;
