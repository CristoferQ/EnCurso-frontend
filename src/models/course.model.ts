// Definir enum con niveles de dificultad del curso
export enum CourseStatus {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

// Definir interfaz de curso
export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  imageUrl?: string;
  isFeatured?: boolean;
}
