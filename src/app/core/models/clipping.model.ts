export type ClippingType = 'match' | 'profile' | 'scandal' | 'reaction';
export type ClippingSize = 'small' | 'medium' | 'wide' | 'featured';

export interface Clipping {
  id: string;
  headline: string;
  tournamentId: string;
  source: string;
  country: string;
  type: ClippingType;
  size: ClippingSize;
  deck: string;
  body: string;
  score?: string;
  photoEmoji?: string;
  photoCaption?: string;
  sortOrder: number;
  isFeatured: boolean;
  tags: string[];
}
