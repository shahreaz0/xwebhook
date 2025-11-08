import xior from "xior";
import errorRetryPlugin from "xior/plugins/error-retry";

export const http = xior.create();

http.plugins.use(
  errorRetryPlugin({
    retryTimes: 3,
    retryInterval(count, _config, _error) {
      return count * 1e1;
    },
    onRetry(config, _error, count) {
      console.log(`${config.method} ${config.url} retry ${count} times`);
    },
  })
);
