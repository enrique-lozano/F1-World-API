import { PhotoSchema } from '../interfaces/photo.schema';

export class Photo implements PhotoSchema {
  url?: string;
  description?: string;
  author?: string;
  site?: string;
  siteURL?: string;
  CCType?: 'BY' | 'BY-SA' | 'BY-ND' | 'BY-NC' | 'BY-NC-ND' | 'Public Domain';
  CC?: number;

  embedId?: number;

  /** On free licensed images, display a custom license text */
  htmlText?: string;

  /** We should put the embedded HTML if required */
  embeddedHTML?: string;

  constructor(data: PhotoSchema) {
    Object.assign(this, data);

    if (this.url) {
      this.htmlText = '';

      if (this.description) this.htmlText += this.description;

      if (this.CC && this.CCType) {
        const CCVersionN = (Math.round(this.CC * 10) / 10).toFixed(1);
        const ccHref =
          this.CCType != 'Public Domain'
            ? 'licenses/' + this.CCType.toLowerCase() + '/' + CCVersionN
            : 'publicdomain/mark/1.0/';

        this.htmlText += ` | Photo by <a target='_blank' href='${
          this.siteURL
        }'>${this.author} on ${
          this.site
        }</a>. <a target='_blank' href='https://creativecommons.org/${ccHref}'>${
          this.CCType != 'Public Domain'
            ? 'CC ' + this.CCType + ' ' + CCVersionN
            : 'Public domain'
        }</a>`;
      }
    } else if (this.embedId) {
      this.embeddedHTML = `<script src='https://embed.smartframe.io/cf672a5debefbf3ded9207696998bf28.js' data-image-id='${this.embedId}' data-width='100%' data-max-width='4804' data-theme='presentation' data-custom-data='%7B%7D' async data-minify='0'></script>`;
    }
  }

  // ! This should not be here. JSON-Schema to TS do not admit anyOf properties
  [k: string]: unknown;
}
