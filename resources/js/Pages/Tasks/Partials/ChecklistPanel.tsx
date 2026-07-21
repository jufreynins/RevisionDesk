import TextInput from '@/Components/TextInput';
import { Task } from '@/types/models';
import { router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ChecklistPanel({ task, canEdit }: { task: Task; canEdit: boolean }) {
    const [newItem, setNewItem] = useState('');
    const items = task.checklist_items ?? [];
    const completed = items.filter((i) => i.is_completed).length;

    function addItem() {
        if (newItem.trim() === '') return;
        router.post(
            route('tasks.checklist-items.store', task.id),
            { item_text: newItem.trim() },
            { onSuccess: () => setNewItem(''), preserveScroll: true },
        );
    }

    function toggleItem(itemId: number, isCompleted: boolean) {
        router.patch(
            route('tasks.checklist-items.update', [task.id, itemId]),
            { is_completed: isCompleted },
            { preserveScroll: true },
        );
    }

    function removeItem(itemId: number) {
        router.delete(route('tasks.checklist-items.destroy', [task.id, itemId]), { preserveScroll: true });
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Checklist</h3>
                {items.length > 0 && (
                    <span className="text-xs text-zinc-500">
                        {completed} of {items.length} completed
                    </span>
                )}
            </div>

            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={item.is_completed}
                            disabled={!canEdit}
                            onChange={(e) => toggleItem(item.id, e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span className={`flex-1 text-sm ${item.is_completed ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                            {item.item_text}
                        </span>
                        {canEdit && (
                            <button onClick={() => removeItem(item.id)} className="text-zinc-300 hover:text-red-600">
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {canEdit && (
                <div className="mt-3 flex gap-2">
                    <TextInput
                        className="block w-full text-sm"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Add checklist item..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem();
                            }
                        }}
                    />
                    <button
                        onClick={addItem}
                        className="inline-flex items-center rounded-lg border border-zinc-300 px-3 text-zinc-600 hover:bg-zinc-50"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
