import { createApp } from './app';
import { config } from './config/env';

createApp().listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Order Processing Service listening on http://localhost:${config.port}`);
});
