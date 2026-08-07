// Definir enum con niveles de dificultad del curso
export enum ConcertStatus {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Definir interfaz de curso
export interface Concert {
  id: string;
  title: string;
  description: string;
  status: ConcertStatus;
  imageUrl?: string;
  isFeatured?: boolean;
}
