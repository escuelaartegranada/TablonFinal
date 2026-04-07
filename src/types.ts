export interface Announcement {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
  targetUrl?: string;
  startAt: string; // ISO string
  endAt?: string; // ISO string
  published: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  displayMode: 'rotation' | 'list';
  rotationDuration: number; // in seconds
  transitionDuration: number; // in milliseconds
  transitionType: 'fade-up' | 'crossfade';
}
