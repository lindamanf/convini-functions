import * as request from 'request';

export class SlackLogger {
  static send(msg: string): void {
    console.log(msg);
    const options = <any>{
      url: 'https://hooks.slack.com/services/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',
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