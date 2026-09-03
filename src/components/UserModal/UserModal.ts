import { UserService } from '../../services/user.service';
import { confirmAction } from '../ConfirmModal';
import type { User } from '../../models';

export function createUserModalElement(onClose: () => void, onUserChanged?: () => void): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in';

  backdrop.innerHTML = `
    <div class="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
      <div class="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-6 bg-sky-500 rounded-xs inline-block"></span>
          <h2 class="text-xl font-bold uppercase tracking-wider text-white">Gestión de Usuarios</h2>
        </div>
        <button id="close-modal-btn" class="text-zinc-400 hover:text-white p-1 rounded transition-colors text-lg font-bold" aria-label="Cerrar">✕</button>
      </div>

      <div class="overflow-y-auto flex-1 py-4 space-y-5">
        <!-- Formulario Crear/Editar Usuario -->
        <section class="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
          <h3 id="form-title" class="text-xs font-black uppercase tracking-wider text-sky-400 mb-3">Crear Nuevo Usuario</h3>
          <form id="user-form" class="flex flex-col gap-2.5">
            <input type="hidden" id="user-id" name="id" value="" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input id="user-name" name="name" required placeholder="Nombre completo" class="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500" />
              <input id="user-email" name="email" required type="email" placeholder="correo@ejemplo.com" class="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500" />
            </div>
            <p id="user-form-error" class="text-red-400 text-xs hidden"></p>
            <div class="flex justify-end gap-2 mt-1">
              <button type="button" id="cancel-edit-btn" class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-zinc-700 rounded hover:bg-zinc-800 text-zinc-300 hidden">Cancelar edición</button>
              <button type="submit" id="save-user-btn" class="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors">Guardar Usuario</button>
            </div>
          </form>
        </section>

        <!-- Lista de Usuarios -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-black uppercase tracking-wider text-zinc-400">Usuarios Registrados</h3>
            <span id="users-count" class="text-xs text-zinc-500 font-mono">0 usuarios</span>
          </div>
          <div id="users-list" class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div class="text-center py-6 text-zinc-500 text-sm">Cargando usuarios...</div>
          </div>
        </section>
      </div>

      <div class="pt-3 border-t border-zinc-800 flex justify-end">
        <button id="close-btn" class="px-4 py-1.5 text-xs font-bold uppercase bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">Cerrar</button>
      </div>
    </div>
  `;

  const form = backdrop.querySelector<HTMLFormElement>('#user-form')!;
  const formTitle = backdrop.querySelector<HTMLElement>('#form-title')!;
  const userIdInput = backdrop.querySelector<HTMLInputElement>('#user-id')!;
  const nameInput = backdrop.querySelector<HTMLInputElement>('#user-name')!;
  const emailInput = backdrop.querySelector<HTMLInputElement>('#user-email')!;
  const errorElement = backdrop.querySelector<HTMLElement>('#user-form-error')!;
  const cancelEditBtn = backdrop.querySelector<HTMLButtonElement>('#cancel-edit-btn')!;
  const usersList = backdrop.querySelector<HTMLElement>('#users-list')!;
  const usersCount = backdrop.querySelector<HTMLElement>('#users-count')!;

  const showError = (msg: string) => {
    errorElement.textContent = msg;
    errorElement.classList.remove('hidden');
  };

  const clearError = () => {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  };

  const resetForm = () => {
    userIdInput.value = '';
    nameInput.value = '';
    emailInput.value = '';
    formTitle.textContent = 'Crear Nuevo Usuario';
    cancelEditBtn.classList.add('hidden');
    clearError();
  };

  const renderUsers = async () => {
    try {
      usersList.innerHTML = `<div class="text-center py-4 text-zinc-500 text-xs">Cargando...</div>`;
      const users = await UserService.getAllUsers();
      usersCount.textContent = `${users.length} ${users.length === 1 ? 'usuario' : 'usuarios'}`;

      if (users.length === 0) {
        usersList.innerHTML = `<div class="text-center py-4 text-zinc-500 text-xs bg-zinc-950/50 rounded border border-dashed border-zinc-800">No hay usuarios registrados</div>`;
        return;
      }

      usersList.innerHTML = users
        .map(
          (u) => `
        <div class="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors" data-user-id="${u.id}">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-sky-950 border border-sky-800 text-sky-400 font-black text-xs flex items-center justify-center shrink-0">
              ${u.id}
            </div>
            <div class="truncate">
              <p class="text-sm font-semibold text-white truncate">${u.name}</p>
              <p class="text-xs text-zinc-400 font-mono truncate">${u.email}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0 ml-2">
            <button data-action="edit-user" data-id="${u.id}" class="p-1.5 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded transition-colors text-xs font-semibold" title="Editar">
              ✏️
            </button>
            <button data-action="delete-user" data-id="${u.id}" data-name="${u.name}" class="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors text-xs font-semibold" title="Eliminar">
              🗑️
            </button>
          </div>
        </div>
      `,
        )
        .join('');
    } catch (err) {
      usersList.innerHTML = `<div class="text-center py-4 text-red-400 text-xs">Error al cargar usuarios</div>`;
    }
  };

  // Eventos de formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const id = userIdInput.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
      showError('Nombre y correo electrónico son requeridos.');
      return;
    }

    try {
      if (id) {
        await UserService.update(id, { name, email });
      } else {
        await UserService.create({ name, email });
      }
      resetForm();
      await renderUsers();
      onUserChanged?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar el usuario.');
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  // Delegación de eventos en lista de usuarios
  usersList.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('button');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;
    if (!id) return;

    if (action === 'edit-user') {
      try {
        const user = await UserService.getUserById(id);
        userIdInput.value = user.id;
        nameInput.value = user.name;
        emailInput.value = user.email;
        formTitle.textContent = `Editar Usuario #${user.id}`;
        cancelEditBtn.classList.remove('hidden');
        clearError();
        nameInput.focus();
      } catch (err) {
        showError('No se pudo cargar el usuario para edición.');
      }
    } else if (action === 'delete-user') {
      const name = button.dataset.name || `ID ${id}`;
      const confirmed = await confirmAction({
        title: 'Eliminar Usuario',
        message: `¿Estás seguro de que deseas eliminar al usuario "${name}"? Se cancelarán automáticamente todas sus inscripciones asociadas.`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        isDestructive: true,
      });

      if (confirmed) {
        try {
          await UserService.delete(id);
          if (userIdInput.value === id) resetForm();
          await renderUsers();
          onUserChanged?.();
        } catch (err) {
          showError(err instanceof Error ? err.message : 'Error al eliminar usuario.');
        }
      }
    }

  });

  // Cerrar modal
  const handleClose = () => {
    backdrop.remove();
    onClose();
  };

  backdrop.querySelector('#close-modal-btn')?.addEventListener('click', handleClose);
  backdrop.querySelector('#close-btn')?.addEventListener('click', handleClose);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) handleClose();
  });

  // Cargar usuarios inicialmente
  renderUsers();

  return backdrop;
}
