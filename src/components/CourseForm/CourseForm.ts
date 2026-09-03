import { CourseStatus, type Course } from '../../models';

export function createCourseFormElement(
  course: Course | undefined,
  onSave: (course: Omit<Course, 'id' | 'isEnrolled' | 'isFeatured' | 'imageUrl'>) => Promise<void>,
  onCancel: () => void,
): HTMLElement {
  const container = document.createElement('section');
  container.className = 'bg-zinc-950 border border-zinc-700 rounded-xl p-5';
  container.innerHTML = `
    <h2 class="text-lg font-black uppercase mb-4">${course ? 'Editar curso' : 'Agregar curso'}</h2>
    <form class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input name="title" required placeholder="Título" value="${course?.title ?? ''}" class="bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
      <input name="price" required type="number" min="0" placeholder="Precio" value="${course?.price ?? 0}" class="bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
      <textarea name="description" required placeholder="Descripción" class="md:col-span-2 bg-zinc-900 border border-zinc-700 rounded p-2 text-white">${course?.description ?? ''}</textarea>
      <select name="level" class="bg-zinc-900 border border-zinc-700 rounded p-2 text-white">
        ${Object.values(CourseStatus).map((level) => `<option value="${level}" ${course?.status === level ? 'selected' : ''}>${level}</option>`).join('')}
      </select>
      <input name="videoUrl" required type="url" placeholder="URL del video" value="${course?.videoUrl ?? ''}" class="bg-zinc-900 border border-zinc-700 rounded p-2 text-white" />
      <p class="course-form-error text-red-400 text-sm md:col-span-2"></p>
      <div class="md:col-span-2 flex gap-2 justify-end">
        <button type="button" data-action="cancel" class="px-3 py-2 border border-zinc-600 rounded text-sm">Cancelar</button>
        <button class="px-3 py-2 bg-sky-600 rounded text-sm font-bold">Guardar</button>
      </div>
    </form>`;

  const form = container.querySelector('form')!;
  const error = container.querySelector<HTMLElement>('.course-form-error')!;
  container.querySelector('[data-action="cancel"]')?.addEventListener('click', onCancel);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      await onSave({
        title: String(data.get('title')),
        description: String(data.get('description')),
        price: Number(data.get('price')),
        status: data.get('level') as CourseStatus,
        videoUrl: String(data.get('videoUrl')),
      });
    } catch (reason) {
      error.textContent = reason instanceof Error ? reason.message : 'No se pudo guardar el curso.';
    }
  });
  return container;
}
