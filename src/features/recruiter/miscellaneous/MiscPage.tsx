import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  CheckSquare,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Plus,
  LayoutGrid,
  List,
  MessageSquare,
  Trash2,
  User,
  GripVertical,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import {
  MiscTask,
  MiscTaskStatus,
  MiscTaskPriority,
} from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

const STATUS_COLUMNS: { id: MiscTaskStatus; title: string; color: string }[] = [
  { id: 'To Do', title: 'To Do', color: 'border-slate-500/30' },
  { id: 'In Progress', title: 'In Progress', color: 'border-teal-500/30' },
  { id: 'Blocked', title: 'Blocked', color: 'border-red-500/30' },
  { id: 'Done', title: 'Completed', color: 'border-emerald-500/30' },
];

const PRIORITY_STYLES: Record<MiscTaskPriority, string> = {
  Low: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  Medium: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  High: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

// Draggable Task Card
const DraggableTaskCard: React.FC<{
  task: MiscTask;
  candidateName?: string;
  onClick: () => void;
}> = ({ task, candidateName, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[var(--color-surface)] p-3.5 rounded-lg border shadow-xs transition-all space-y-2 select-none ${
        isDragging
          ? 'opacity-60 shadow-lg border-teal-500 ring-2 ring-teal-500/20'
          : 'border-[var(--color-border)] hover:border-teal-500/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <p
            className="font-semibold text-xs text-[var(--color-text)] truncate cursor-pointer hover:text-teal-600"
            onClick={onClick}
          >
            {task.title}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{task.description}</p>

      {candidateName && (
        <div className="text-[11px] font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded">
          <User className="w-3 h-3" /> {candidateName}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)]">
        <span>Due {task.dueDate}</span>
        <div className="flex items-center gap-2">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="w-3 h-3" /> {task.comments.length}
            </span>
          )}
          <span className="font-medium text-[var(--color-text)]">{task.assignee}</span>
        </div>
      </div>
    </div>
  );
};

// Droppable Column
const DroppableColumn: React.FC<{
  column: { id: MiscTaskStatus; title: string };
  count: number;
  children: React.ReactNode;
}> = ({ column, count, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-[var(--color-surface-2)]/60 rounded-xl p-3 border flex flex-col min-w-[260px] transition-colors ${
        isOver ? 'border-teal-500 bg-teal-500/5' : 'border-[var(--color-border)]'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-3">
        <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text)]">
          {column.title}
        </span>
        <span className="text-xs font-mono font-semibold bg-[var(--color-surface)] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)]">
          {count}
        </span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">{children}</div>
    </div>
  );
};

export const MiscPage: React.FC = () => {
  const candidates = useHiringStore((state) => state.candidates);
  const miscTasks = useHiringStore((state) => state.miscTasks);
  const addMiscTask = useHiringStore((state) => state.addMiscTask);
  const updateMiscTaskStatus = useHiringStore((state) => state.updateMiscTaskStatus);
  const addMiscComment = useHiringStore((state) => state.addMiscComment);
  const deleteMiscTask = useHiringStore((state) => state.deleteMiscTask);

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Task Detail / Edit Modal
  const [activeTask, setActiveTask] = useState<MiscTask | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Create Task Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    candidateId: '',
    category: 'Welcome Kit' as MiscTask['category'],
    assignee: 'Priya Nair',
    priority: 'Medium' as MiscTaskPriority,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    status: 'To Do' as MiscTaskStatus,
  });

  // KPI Stat cards
  const stats = useMemo<StatItem[]>(() => {
    const total = miscTasks.length;
    const inProgress = miscTasks.filter((t) => t.status === 'In Progress').length;
    const blocked = miscTasks.filter((t) => t.status === 'Blocked').length;
    const done = miscTasks.filter((t) => t.status === 'Done').length;

    return [
      {
        id: 'total-tasks',
        label: 'Total Custom Tasks',
        value: total,
        subtitle: 'Logistics, welcome kits, queries',
        icon: CheckSquare,
      },
      {
        id: 'in-progress',
        label: 'In Progress',
        value: inProgress,
        subtitle: 'Being fulfilled by coordinators',
        icon: Clock,
        variant: 'teal',
      },
      {
        id: 'blocked',
        label: 'Blocked Issues',
        value: blocked,
        subtitle: 'Awaiting candidate or vendor input',
        icon: AlertOctagon,
        variant: 'danger',
      },
      {
        id: 'done',
        label: 'Resolved & Closed',
        value: done,
        subtitle: `${total > 0 ? Math.round((done / total) * 100) : 0}% completion`,
        icon: CheckCircle2,
        variant: 'success',
      },
    ];
  }, [miscTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return miscTasks.filter((task) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchAssignee = task.assignee.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAssignee) return false;
      }
      if (filters.status && task.status !== filters.status) return false;
      if (selectedCategory && task.category !== selectedCategory) return false;
      return true;
    });
  }, [miscTasks, filters, selectedCategory]);

  const columns = useMemo<ColumnDef<MiscTask>[]>(
    () => [
      {
        id: 'title',
        header: 'Task Title & Category',
        cell: ({ row }) => {
          const t = row.original;
          const cand = candidates.find((c) => c.id === t.candidateId);
          return (
            <div>
              <p
                className="font-semibold text-xs text-[var(--color-text)] hover:text-teal-600 cursor-pointer"
                onClick={() => setActiveTask(t)}
              >
                {t.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-teal-600 font-semibold bg-teal-500/10 px-1.5 py-0.2 rounded">
                  {t.category}
                </span>
                {cand && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    For: {cand.name}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text)] font-medium">
            {row.original.assignee}
          </span>
        ),
      },
      {
        id: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              PRIORITY_STYLES[row.original.priority]
            }`}
          >
            {row.original.priority}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {row.original.dueDate}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusPill status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setActiveTask(t)}
              >
                View
              </Button>
            </div>
          );
        },
      },
    ],
    [candidates]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetStatus = over.id as MiscTaskStatus;

    updateMiscTaskStatus(taskId, targetStatus);
    toast.success(`Moved task to "${targetStatus}"`);
  };

  const handleCreateTask = () => {
    if (!createForm.title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    addMiscTask({
      title: createForm.title,
      description: createForm.description,
      candidateId: createForm.candidateId || undefined,
      category: createForm.category,
      assignee: createForm.assignee,
      priority: createForm.priority,
      dueDate: createForm.dueDate,
      status: createForm.status,
    });

    toast.success(`Created task "${createForm.title}"`);
    setIsCreateOpen(false);
    setCreateForm({
      title: '',
      description: '',
      candidateId: '',
      category: 'Welcome Kit',
      assignee: 'Priya Nair',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      status: 'To Do',
    });
  };

  const handleAddComment = () => {
    if (!activeTask || !newCommentText.trim()) return;
    addMiscComment(activeTask.id, newCommentText.trim(), 'Priya Nair');
    setNewCommentText('');
    toast.success('Comment posted');
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Other Miscellaneous Tasks"
        subtitle="Manage logistics tickets, welcome pack couriers, relocation cab bookings, and candidate queries."
        breadcrumb="Miscellaneous"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border)]">
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'board'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                type="button"
                className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] font-semibold shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>

            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4" /> Create Task
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        statusOptions={[
          { label: 'To Do', value: 'To Do' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Blocked', value: 'Blocked' },
          { label: 'Done', value: 'Done' },
        ]}
        searchPlaceholder="Search task title, description, assignee..."
      />

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['', 'Welcome Kit', 'Relocation Logistics', 'IT Logistics', 'Special Approvals', 'General Query'].map((cat) => (
          <button
            key={cat || 'all'}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat || 'All Categories'}
          </button>
        ))}
      </div>

      {/* View: DnD Board or List Table */}
      {viewMode === 'list' ? (
        <DataTable data={filteredTasks} columns={columns} searchKey="title" />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <DroppableColumn key={col.id} column={col} count={columnTasks.length}>
                  {columnTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)] italic">
                      Drag tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const cand = candidates.find((c) => c.id === task.candidateId);
                      return (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          candidateName={cand?.name}
                          onClick={() => setActiveTask(task)}
                        />
                      );
                    })
                  )}
                </DroppableColumn>
              );
            })}
          </div>
        </DndContext>
      )}

      {/* Create Task Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Operational Task"
        size="lg"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Task Title
            </label>
            <Input
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Courier branded swag kit & hoodie to candidate address"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
              Description & Details
            </label>
            <Input
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Provide tracking details, consignee contact or vendor invoice..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Associated Candidate
              </label>
              <Select
                value={createForm.candidateId}
                onChange={(e) => setCreateForm({ ...createForm, candidateId: e.target.value })}
              >
                <option value="">None (General Org Task)</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.candidateId})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Category
              </label>
              <Select
                value={createForm.category}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    category: e.target.value as MiscTask['category'],
                  })
                }
              >
                <option value="Welcome Kit">Welcome Kit</option>
                <option value="Relocation">Relocation & Logistics</option>
                <option value="Approvals">Special Approvals</option>
                <option value="Queries">Candidate Queries</option>
                <option value="General">General HR Operations</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Priority
              </label>
              <Select
                value={createForm.priority}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    priority: e.target.value as MiscTaskPriority,
                  })
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Assignee
              </label>
              <Input
                value={createForm.assignee}
                onChange={(e) => setCreateForm({ ...createForm, assignee: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--color-text)] mb-1 block">
                Due Date
              </label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Task Detail & Comments Dialog */}
      <Dialog
        isOpen={!!activeTask}
        onClose={() => setActiveTask(null)}
        title={activeTask?.title || 'Task Details'}
        size="lg"
      >
        {activeTask && (
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--color-surface-2)] p-3 rounded-xl text-xs">
              <div>
                <span className="text-[var(--color-text-muted)] block">Category:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {activeTask.category}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Assignee:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {activeTask.assignee}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Due Date:</span>
                <span className="font-mono text-[var(--color-text)]">{activeTask.dueDate}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Status:</span>
                <StatusPill status={activeTask.status} />
              </div>
            </div>

            <div className="text-xs text-[var(--color-text)] bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)]">
              <span className="font-semibold block mb-1">Details:</span>
              <p className="text-[var(--color-text-muted)]">{activeTask.description}</p>
            </div>

            {/* Comment Thread */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Comments Thread ({activeTask.comments.length})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeTask.comments.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] italic">No comments yet.</p>
                ) : (
                  activeTask.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                        <span className="font-semibold text-[var(--color-text)]">{c.author}</span>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[var(--color-text)]">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Input
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Post an update or paste courier tracking number..."
                  className="text-xs"
                />
                <Button size="sm" className="bg-teal-600 text-white shrink-0" onClick={handleAddComment}>
                  Comment
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                className="text-xs text-red-600 hover:bg-red-500/10"
                onClick={() => {
                  deleteMiscTask(activeTask.id);
                  toast.success('Deleted task');
                  setActiveTask(null);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Task
              </Button>
              <Button variant="outline" onClick={() => setActiveTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
