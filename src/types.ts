export type Category = 'books' | 'games' | 'movies' | 'series' | 'comics'

export type Status = 'backlog' | 'ongoing' | 'done'

export interface BaseItem {
  id: string
  category: Category
  title: string
  status: Status
  rating?: number // 1-5, only relevant when done
  notes?: string
  createdAt: number // epoch ms
  updatedAt: number // epoch ms
  completedAt?: number // epoch ms, set only when status becomes 'done'; unlike updatedAt it's not touched by later edits
}

export interface BookItem extends BaseItem {
  category: 'books'
  author?: string
}

export interface GameItem extends BaseItem {
  category: 'games'
  developer?: string
}

export interface MovieItem extends BaseItem {
  category: 'movies'
  director?: string
}

export interface SeriesItem extends BaseItem {
  category: 'series'
  creator?: string
  seasonProgress?: string // e.g. "S2E5"
}

export interface ComicItem extends BaseItem {
  category: 'comics'
  author?: string
}

export type TrackedItem = BookItem | GameItem | MovieItem | SeriesItem | ComicItem

export const CATEGORY_LABELS: Record<Category, string> = {
  books: 'Libros',
  games: 'Juegos',
  movies: 'Películas',
  series: 'Series',
  comics: 'Comics',
}

export const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Pendiente',
  ongoing: 'En curso',
  done: 'Terminado',
}

export const CATEGORY_CREATOR_LABEL: Record<Category, string> = {
  books: 'Autor',
  games: 'Desarrolladora',
  movies: 'Director',
  series: 'Creador',
  comics: 'Autor',
}

export const CATEGORY_CREATOR_FIELD: Record<Category, 'author' | 'developer' | 'director' | 'creator'> = {
  books: 'author',
  games: 'developer',
  movies: 'director',
  series: 'creator',
  comics: 'author',
}
