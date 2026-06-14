export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  brand: string;
  review: string;
  stars: number;
  createdAt?: string;
}

export const CATEGORIES = [
  'Thumbnails',
  'Instagram Posts',
  'Posters',
  'Campaign Designs',
  'Logos',
  'Websites'
];
