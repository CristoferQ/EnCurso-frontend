import { CourseStatus, type Course } from '../../models';
import { useI18n } from '../../i18n/i18n.service';

export function createCourseModalElement(
  course: Course | undefined,
  onSave: (course: Omit<Course, 'id' | 'isEnrolled' | 'isFeatured' | 'imageUrl'>) => Promise<void>,
  onClose: () => void,
): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in';

  const i18n = useI18n();
  const t = i18n.courseModal;
  const isEditing = Boolean(course);
  const modalHeaderTitle = isEditing ? `${t.editTitle}: ${course?.title}` : t.newTitle;

  backdrop.innerHTML = `
    <div class="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
      <div class="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-6 bg-sky-500 rounded-xs inline-block"></span>
          <h2 class="text-xl font-bold uppercase tracking-wider text-white">${modalHeaderTitle}</h2>
        </div>
        <button id="close-modal-btn" class="text-zinc-400 hover:text-white p-1 rounded transition-colors text-lg font-bold" aria-label="${t.cancel}">✕</button>
      </div>

      <div class="overflow-y-auto flex-1 py-4">
        <form id="course-form" class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">${t.titleLabel}</label>
            <input name="title" required placeholder="${t.titlePlaceholder}" value="${course?.title ?? ''}" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">${t.priceLabel}</label>
            <input name="price" required type="number" min="0" placeholder="${t.pricePlaceholder}" value="${course?.price ?? 0}" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">${t.levelLabel}</label>
            <select name="level" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors">
              ${Object.values(CourseStatus).map((level) => {
                const label = i18n.levels[level] || level;
                return `<option value="${level}" ${course?.status === level ? 'selected' : ''}>${label}</option>`;
              }).join('')}
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">${t.videoLabel}</label>
            <input name="videoUrl" required type="url" placeholder="${t.videoPlaceholder}" value="${course?.videoUrl ?? ''}" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">${t.descLabel}</label>
            <textarea name="description" required rows="3" placeholder="${t.descPlaceholder}" class="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors resize-none">${course?.description ?? ''}</textarea>
          </div>

          <p id="course-form-error" class="text-red-400 text-xs md:col-span-2 hidden"></p>

          <div class="md:col-span-2 flex gap-2.5 justify-end pt-3 border-t border-zinc-800">
            <button type="button" id="cancel-btn" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-700 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors">
              ${t.cancel}
            </button>
            <button type="submit" id="save-btn" class="px-5 py-2 text-xs font-black uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-lg shadow-sky-950/50">
              ${isEditing ? t.save : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = backdrop.querySelector<HTMLFormElement>('#course-form')!;
  const errorElement = backdrop.querySelector<HTMLElement>('#course-form-error')!;

  const showError = (msg: string) => {
    errorElement.textContent = msg;
    errorElement.classList.remove('hidden');
  };

  const clearError = () => {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  };

  const handleClose = () => {
    backdrop.remove();
    document.removeEventListener('keydown', handleKeyDown);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  };

  backdrop.querySelector('#close-modal-btn')?.addEventListener('click', handleClose);
  backdrop.querySelector('#cancel-btn')?.addEventListener('click', handleClose);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });
  document.addEventListener('keydown', handleKeyDown);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();

    const data = new FormData(form);
    const titleVal = String(data.get('title')).trim();
    const descVal = String(data.get('description')).trim();
    const priceVal = Number(data.get('price'));
    const levelVal = data.get('level') as CourseStatus;
    const videoUrlVal = String(data.get('videoUrl')).trim();

    if (!titleVal || !descVal || !videoUrlVal) {
      showError(t.validationTitle);
      return;
    }

    try {
      await onSave({
        title: titleVal,
        description: descVal,
        price: priceVal,
        status: levelVal,
        videoUrl: videoUrlVal,
      });
      handleClose();
    } catch (reason) {
      showError(reason instanceof Error ? reason.message : 'Error al guardar el curso.');
    }
  });

  return backdrop;
}
