import puppeteer from 'puppeteer';
import * as punycode from 'punycode';
import { SlackLogger } from '../slack-logger';
import { ProductService } from '../service/product_service';
import { Product } from '../interface';

class SevenClass {
  private regionMap = new Map([
    ['東北', ['青森', '秋田', '岩手', '宮城', '福島', '山形']],
    ['関東', ['栃木', '茨城', '東京', '神奈川', '千葉', '埼玉', '群馬']],
    ['甲信越', ['山梨', '長野', '新潟']],
    ['北陸', ['富山', '石川', '福井']],
    ['東海', ['静岡', '愛知', '岐阜', '三重']],
    ['近畿', ['奈良', '和歌山', '滋賀', '京都', '大阪', '兵庫']],
    ['中国', ['岡山', '広島', '鳥取', '島根', '山口']],
    ['四国', ['徳島', '香川', '愛媛', '高知']],
    ['九州', ['福岡', '佐賀', '長崎', '大分', '熊本', '宮崎', '鹿児島']],
    ['首都圏', ['東京', '神奈川', '千葉', '埼玉']],
    ['北関東', ['栃木', '茨城', '群馬']],
    ['中京', ['愛知', '岐阜', '三重']],
    ['東京都', ['東京']],
  ]);
  private uri = 'https://www.sej.co.jp';
  private areaUrl = `${this.uri}/products/a/thisweek/area`;

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

  private convertReleasedAt(text: string | null): Date | null {
    const match = text?.match(/(\d+)年(\d+)月(\d+)日/);
    if(!match || match.length < 4) {
      return null;
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  private convertRegions(text: string | null): string[] {
    if(!text) return [];
    const places = text.replace(/(（.+）)|(販売地域：)|(一部)/g,'').split("、");
    return this.getPrefectures(places);
  }

  private convertUrl(text: string | null): string | null {
    if(!text) return null;
    return `${this.uri}${text}`
  }

  private async crowlProduct(item: puppeteer.ElementHandle<Element>): Promise<[Product | null, string]> {
    const name = await item.$eval('.item_ttl a', e => e.textContent);
    if(!name) {
      return [null, 'Error: Failed to get product name.'];
    }
    const id = punycode.encode(name);
    if(await ProductService.fetch(id)) {
      return [null, `${name} already exists.`];
    }
    return [{ 
      id,
      name,
      brand: 'seven',
      price: this.convertPrice(await item.$eval('.item_price p', e => e.textContent)),
      releasedAt: this.convertReleasedAt(await item.$eval('.item_launch p', e => e.textContent)),
      regions: this.convertRegions(await item.$eval('.item_region p', e => e.textContent)),
      url: this.convertUrl(await item.$eval('.item_ttl a', e => e.getAttribute('href'))),
      image: null,
    }, ''];
  }

  public async fetchProducts(region: string) {
    SlackLogger.send(`*###### Start seven crowler in ${region}. ######*`);
    let counter = 0;
    let logger: string[] = [];
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(`${this.areaUrl}/${region}/1/l100`);
      let pageCount = 1;
      const pager = await page.$('.pager');
      if(pager) pageCount = (await pager.$$('.pager_num')).length;
      for(let i = 0; i < pageCount; i++) {
        logger.push(`${region} page:${i + 1}`);
        await page.goto(`${this.areaUrl}/${region}/${i + 1}/l100`);
        const items = await page.$$('.list_inner');
        await Promise.all(items.map(async item => {
          const [product, err] = await this.crowlProduct(item);
          if(!product) {
            logger.push(err);
          } else {
            await ProductService.set(product);
            logger.push(`*[${product.brand}] ${product.name} is created.* id=${product.id}`);
            counter++;
          }
          if(logger.length > 30) {
            SlackLogger.send(logger.join('\n'));
            logger = [];
          }
        }));
        SlackLogger.send(logger.join('\n'));
      }
      await browser.close();
    } catch(err) {
      SlackLogger.send(`sevenCrowler is failed.\n${err}`);
    }
    SlackLogger.send(`*###### End seven crowler in ${region}. Getting ${counter} Products. ######*`);
  }
}

export const Seven = new SevenClass();