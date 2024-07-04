import { AxiosInstance } from 'axios';
import mongoose from 'mongoose';
import qs from 'querystring';
import _ from 'lodash';

const NAMESPACE = 'axios-logger-mongo';

const logRequest = (logModel: any) => (axiosConfig: any) => {
  axiosConfig[NAMESPACE] = Object.assign({
    requestTimestamp: Date.now()
  }, axiosConfig);
  return axiosConfig;
}

function createRequestObject({ axiosConfig, axiosRequest }: any) {
  const url = new URL(axiosConfig.url);

  const requestHeaders: any = {
    host: url.host,
    ..._.mapKeys(axiosConfig.headers, (val, key) => key.toLowerCase()),
  };

  let requestBody;

  if (
    requestHeaders['content-type'] &&
    requestHeaders['content-type'].startsWith('application/json')
  ) {
    try {
      requestBody = JSON.parse(axiosConfig.data);
    } catch (err) {
      requestBody = requestBody || null;
    }
  } else {
    requestBody = axiosConfig.data || null;
  }

  return {
    method: axiosRequest.method || axiosConfig.method.toUpperCase(),
    path: axiosRequest.path || url.pathname,
    headers: requestHeaders,
    query: {
      ...qs.parse(url.search.replace('?', '')),
      ...axiosConfig.params,
    },
    body: requestBody,
  };
}

function createResponseObject({ axiosResponse }: any) {
  let body = axiosResponse.data || null;

  return {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers: axiosResponse.headers,
    body,
  };
}

const logResponse = (logModel: any) => (axiosResponse: any) => {
  const axiosConfig = axiosResponse.config;
  const axiosRequest = axiosResponse.request;

  const { requestTimestamp } = axiosConfig[NAMESPACE];
  const responseTimestamp = Date.now();

  const request = createRequestObject({
    axiosConfig,
    axiosRequest
  });

  const response = createResponseObject({
    axiosResponse
  });

  logModel.create({
    request,
    response,
    error: null,
    requestTimestamp,
    responseTimestamp,
    duration: responseTimestamp - requestTimestamp
  });

  return axiosResponse;
}

const logError = (logModel: any) => (axiosError: any) => {
  const axiosConfig = axiosError.config;
  const axiosRequest = axiosError.request;

  const { requestTimestamp } = axiosConfig[NAMESPACE];
  const responseTimestamp = Date.now();

  const request = createRequestObject({
    axiosConfig,
    axiosRequest,
  });

  const response = null;

  const error = axiosError.message;

  logModel.create({
    request,
    response,
    error,
    requestTimestamp,
    responseTimestamp,
    duration: responseTimestamp - requestTimestamp,
  });

  return Promise.reject(axiosError);
}

export function useMongoLogger(
  axios: AxiosInstance,
  {
    mongoURL,
    collectionName
  }: {
    mongoURL: string;
    collectionName?: string;
  }
) {
  mongoose.connect(mongoURL);

  const logSchema = new mongoose.Schema({
    request: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed,
    error: mongoose.Schema.Types.Mixed,
    requestTimestamp: mongoose.Schema.Types.Mixed,
    responseTimestamp: mongoose.Schema.Types.Mixed,
    duration: mongoose.Schema.Types.Mixed,
  });

  const logModel = mongoose.model('AxiosLog', logSchema, collectionName);

  axios.interceptors.request.use(logRequest(logModel));
  axios.interceptors.response.use(
    logResponse(logModel),
    logError(logModel)
  )
}
