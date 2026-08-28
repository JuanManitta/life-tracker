import type { TrackedItem } from '@/types'

/**
 * Seed data for the initial bulk import (one-off migration from the previous
 * Notion trackers). Meant to be consumed by a temporary import button and
 * removed afterwards — see App.tsx `handleSeedImport`.
 */
let counter = 0
function id() {
  counter += 1
  return `seed-${Date.now()}-${counter}`
}

function make(
  category: TrackedItem['category'],
  title: string,
  status: TrackedItem['status'],
  extra: Record<string, unknown> = {}
): TrackedItem {
  const now = Date.now()
  return {
    id: id(),
    category,
    title,
    status,
    createdAt: now,
    updatedAt: now,
    ...extra,
  } as TrackedItem
}

export const seedItems: TrackedItem[] = [
  // ---- Videojuegos ----
  make('games', 'Batman: Arkham Knight', 'done'),
  make('games', 'Alan Wake', 'done'),
  make('games', 'Control', 'done'),
  make('games', 'Crimson Desert', 'done'),
  make('games', 'Alan Wake 2', 'done'),
  make('games', 'Resident Evil 9', 'done'),
  make('games', 'The Alters', 'done'),
  make('games', "Baldur's Gate", 'backlog'),
  make('games', 'Dispatch', 'backlog'),
  make('games', 'Keep Driving', 'backlog'),

  // ---- Peliculas (director agregado donde tengo certeza) ----
  make('movies', 'Sentimental Value', 'done', { director: 'Joachim Trier' }),
  make('movies', 'Blue Moon', 'done', { director: 'Richard Linklater' }),
  make('movies', 'The Secret Agent', 'done', { director: 'Kleber Mendonça Filho' }),
  make('movies', 'Parasite', 'done', { director: 'Bong Joon-ho' }),
  make('movies', 'Hamnet', 'done', { director: 'Chloé Zhao' }),
  make('movies', 'Batman Begins', 'done', { director: 'Christopher Nolan' }),
  make('movies', 'Marty Supreme', 'done'),
  make('movies', 'En la Toscana', 'done'),
  make('movies', 'Cumbres Borrascosas', 'done'),
  make('movies', 'La Novia!', 'done'),
  make('movies', 'Todopoderoso 2', 'done', { director: 'Tom Shadyac' }),
  make('movies', 'Send Help', 'done'),
  make('movies', 'Red Eye', 'done', { director: 'Wes Craven' }),
  make('movies', 'Rental Family', 'done'),
  make('movies', 'The Bastard', 'done'),
  make('movies', 'La Sombra del Pasado', 'backlog'),
  make('movies', 'Alguien Voló Sobre el Nido del Cuco', 'backlog', { director: 'Milos Forman' }),
  make('movies', 'Barton Fink', 'backlog', { director: 'Joel & Ethan Coen' }),
  make('movies', 'No Es País para Viejos', 'backlog', { director: 'Joel & Ethan Coen' }),
  make('movies', 'Proyecto Salvación', 'backlog'),
  make('movies', 'Núremberg', 'done', { director: 'James Vanderbilt' }),
  make('movies', 'El Diablo Viste de Prada 2', 'done', { director: 'David Frankel' }),
  make('movies', 'Un Don Excepcional', 'done', { director: 'Marc Webb' }),
  make('movies', 'Obsession', 'done', { director: 'Curry Barker' }),
  make('movies', 'He-Man y los Masters del Universo', 'done', { director: 'Travis Knight' }),
  make('movies', 'La Odisea', 'done', { director: 'Christopher Nolan' }),
  make('movies', 'Vengadores: Endgame', 'done', { director: 'Anthony Russo & Joe Russo' }),
  make('movies', 'Spider-Man: Brand New Day', 'done', { director: 'Destin Daniel Cretton' }),
  make('movies', 'El Drama', 'done', { director: 'Kristoffer Borgli' }),

  // ---- Libros ----
  make('books', 'Excalibur', 'done', { author: 'Bernard Cornwell' }),
  make('books', 'El Caballero de los 7 Reinos', 'done', { author: 'George R.R. Martin' }),
  make('books', 'El Poeta', 'done', { author: 'Michael Connelly' }),
  make('books', 'El Imperio del Vampiro', 'done', { author: 'Christopher Buehlman' }),
  make('books', 'Las Noches Blancas', 'done', { author: 'Fiódor Dostoievski' }),
  make('books', 'Pobre Gente', 'done', { author: 'Fiódor Dostoievski' }),
  make('books', 'El Señor de los Anillos', 'backlog', { author: 'J.R.R. Tolkien' }),
  make('books', 'Cuentos', 'backlog', { author: 'Fiódor Dostoievski' }),
  make('books', 'El Eco Negro', 'backlog', { author: 'Michael Connelly' }),
  make('books', 'Entre Dos Fuegos', 'backlog'),
  make('books', 'El Secreto', 'backlog', { author: 'Donna Tartt' }),
  make('books', 'Las 3 Noches', 'backlog', { author: 'Austin Wright' }),
  make('books', 'El Adversario', 'backlog', { author: 'Emmanuel Carrère' }),

  // ---- Comics ----
  make('comics', 'Batman Year One', 'done', { author: 'Frank Miller' }),
  make('comics', 'Batman: The Long Halloween', 'done', { author: 'Jeph Loeb' }),
  make('comics', 'Batman: Ego and Other Tails', 'done', { author: 'Darwyn Cooke' }),
  make('comics', 'Batman: The Man Who Laughs', 'done', { author: 'Ed Brubaker' }),
  make('comics', 'Daredevil: Shadowlands', 'done', { author: 'Chip Zdarsky' }),
  make('comics', 'Daredevil (Mark Waid)', 'ongoing', { author: 'Mark Waid' }),
  make('comics', 'Batman: Dark Victory', 'backlog', { author: 'Jeph Loeb' }),

  // ---- Series ----
  make('series', 'His & Her', 'done'),
  make('series', 'Daredevil', 'done', { creator: 'Drew Goddard' }),
  make('series', 'Rooster', 'done'),
  make('series', 'Off Campus', 'done'),
  make('series', 'Young Sherlock', 'done'),
  make('series', 'Attack on Titan', 'done', { creator: 'Hajime Isayama' }),
  make('series', 'El Caballero de los Siete Reinos', 'done', { creator: 'George R.R. Martin' }),
  make('series', 'The Studio', 'backlog', { creator: 'Seth Rogen & Evan Goldberg' }),
]
