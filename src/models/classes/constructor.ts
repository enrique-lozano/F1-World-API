export type ConstructorStorage = Constructor;

export class Constructor {
  id: string;
  name: string;
  fullName: string;
  countryId: string;
  photo: string | null;
  summary: string | null;
  wikiUrl: string | null;

  constructor(data: ConstructorStorage) {
    this.id = data.id;
    this.name = data.name;
    this.fullName = data.fullName;
    this.countryId = data.countryId;
    this.wikiUrl = data.wikiUrl;
    this.photo = data.photo;

    if (data.summary) {
      this.summary = data.summary
        .split('\\n')
        .map((s) => `<p>${s}</p>`)
        .join('')
        .replaceAll('<p></p>', '');
    } else {
      this.summary = null;
    }
  }
}
