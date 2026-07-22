import TextInput from '@/Components/TextInput';
import { Task } from '@/types/models';
import { router } from '@inertiajs/react';
import { Check, Plus, Trash2 } from 'lucide-react';
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
        <div className="card">
            <div className="card-header">
                <div className="card-title">Checklist</div>
                {items.length > 0 && (
                    <div className="card-subtitle">
                        {completed} of {items.length} completed
                    </div>
                )}
            </div>
            <div className="card-body" style={{ padding: '8px 16px' }}>
                {items.map((item) => (
                    <div className="todo-row" key={item.id} style={{ opacity: canEdit ? 1 : 0.7 }}>
                        <button
                            type="button"
                            className={`todo-cb ${item.is_completed ? 'done' : ''}`}
                            disabled={!canEdit}
                            onClick={() => toggleItem(item.id, !item.is_completed)}
                        >
                            {item.is_completed && <Check width={10} height={10} strokeWidth={3} />}
                        </button>
                        <span className="todo-text" style={item.is_completed ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}>
                            {item.item_text}
                        </span>
                        {canEdit && (
                            <button onClick={() => removeItem(item.id)} style={{ color: 'var(--text-muted)' }}>
                                <Trash2 width={14} height={14} strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                ))}

                {canEdit && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <TextInput
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
                        <button onClick={addItem} className="btn btn-outline">
                            <Plus width={16} height={16} strokeWidth={1.5} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
