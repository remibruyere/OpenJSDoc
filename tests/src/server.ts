import { App } from 'uWebSockets.js';
import { accountRouter } from './controller/router';

const app = App();

accountRouter(app);

app.listen(4001, (token) => {
  if (token) {
    console.log(`Listening to port`);
  } else {
    console.log(`Failed to listen to port`);
  }
});
