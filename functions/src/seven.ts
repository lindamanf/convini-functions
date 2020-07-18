import puppeteer from 'puppeteer';
import * as punycode from 'punycode';
import { Product } from './interface';
import { SlackLogger } from './slack-logger';

class SevenClass {
  private regionMap = new Map([
    ['東北', ['青森', '秋田', '岩手', '宮城', '福島', '山形']],
    ['関東', ['栃木', '茨城', '東京', '神奈川', '千葉', '埼玉', '群馬']],
    ['甲信越・北陸', ['山梨', '長野', '新潟', '富山', '石川', '福井']],
    ['東海', ['静岡', '愛知', '岐阜', '三重']],
    ['近畿', ['奈良', '和歌山', '滋賀', '京都', '大阪', '兵庫']],
    ['中国・四国', ['岡山', '広島', '鳥取', '島根', '山口', '徳島', '香川', '愛媛', '高知']],
    ['九州', ['福岡', '佐賀', '長崎', '大分', '熊本', '宮崎', '鹿児島']],
    ['首都圏', ['東京', '神奈川', '千葉', '埼玉']],
    ['北関東', ['栃木', '茨城', '群馬']],
    ['中京', ['愛知', '岐阜', '三重']],
    ['北陸', ['富山', '石川', '福井']]
  ]);
  private url = 'https://www.sej.co.jp/products/a/thisweek/';
  private defaultDate = new Date(1993,2,28)

  private getPrefectures(regions: string[]): string[] {
      const area = regions.filter(region => this.regionMap.get(region));
      if(area.length === 0) {
        return regions;
      }
      const prefectures = regions.filter(region => area.indexOf(region) === -1);
      area.map(m => this.regionMap.get(m)?.map(e => prefectures.push(e)));
      return prefectures;
  }

  private convertPrice(text: string | null): number {
    const match = text?.match(/税込(\d+)円/);
    if(!match || match.length < 1) {
      return -1;
    }
    return Number(match[1]);
  }

  private convertReleasedAt(text: string | null): Date {
    const match = text?.match(/(\d+)年(\d+)月(\d+)日/);
    if(!match || match.length < 4) {
      return this.defaultDate;
    }
    return new Date(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  private convertRegions(text: string | null): string[] {
    if(!text) return [];
    const places = text.replace(/(（.+）)|(販売地域：)|(一部)/g,'').split("、");
    return this.getPrefectures(places);
  }

  public async fetchProducts() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(this.url);
    const items = await page.$$('.list_inner');
    const products: Product[] = [];
    await Promise.all(items.map(async item => {
        const name = await item.$eval('.item_ttl a', e => e.textContent);
        if(products.some(p => p.name === name) || !name) {
          SlackLogger.send('Error: Failed to get product name.');
          return;
        }
        products.push({ 
          id: punycode.encode(name),
          name,
          price: this.convertPrice(await item.$eval('.item_price p', e => e.textContent)),
          releasedAt: this.convertReleasedAt(await item.$eval('.item_launch p', e => e.textContent)),
          regions: this.convertRegions(await item.$eval('.item_region p', e => e.textContent)),
          url: (await item.$eval('.item_ttl a', e => e.getAttribute('href'))) ?? '',
        });
    }));
    await browser.close();

    return products;
  }
}

export const Seven = new SevenClass();