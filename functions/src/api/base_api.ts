import * as request from 'request';
import { SlackLogger } from '../slack-logger';

export abstract class BaseApi {
  protected post(url = '', form = {}) {
    const options = {
      url,
      headers: { 'Content-type': 'application/json' },
      form
    }
    request.post(options, (err) => {
      if(err) {
        SlackLogger.send(err);
      }
    }); 
  }
}
