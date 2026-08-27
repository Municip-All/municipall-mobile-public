import type { Href } from 'expo-router';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type RouteHref = Href;

export type ThemeId = 'light' | 'dark' | 'system';

export type KeyboardType =
  | 'default'
  | 'email-address'
  | 'numeric'
  | 'phone-pad'
  | 'number-pad'
  | 'decimal-pad'
  | 'visible-password'
  | 'ascii-capable'
  | 'numbers-and-punctuation'
  | 'url'
  | 'name-phone-pad'
  | 'twitter'
  | 'web-search';

export interface UserRating {
  stars: number;
  message?: string;
  createdAt: string;
}
