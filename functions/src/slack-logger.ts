import * as request from 'request';

export class SlackLogger {
  static send(msg: string): void {
    const options = <any>{
      url: '',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: '#batch',
        username: 'convini-api bot',
        text: msg,
        link_names: 1,
        icon_emoji: ':bow:',
      })
    };
    request.post(options);
  }
}