export type ArticleSize = 'small' | 'medium' | 'wide' | 'featured';

export interface NewsArticle {
  id: string;
  headline: string;
  deck: string;
  source: string;
  sourceCountry: string;
  body: string;
  url: string;
  publishedAt: Date;
  isBreaking: boolean;
  tags: string[];
  size: ArticleSize;
}
