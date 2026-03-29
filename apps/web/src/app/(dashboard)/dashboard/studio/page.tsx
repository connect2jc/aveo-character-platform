'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Plus, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudio } from '@/hooks/use-studio';
import { formatDate, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  DRAFT: { label: 'Draft', icon: Clock, color: 'text-gray-500' },
  RENDERING: { label: 'Rendering', icon: Loader2, color: 'text-blue-500' },
  COMPLETED: { label: 'Completed', icon: CheckCircle, color: 'text-green-500' },
  FAILED: { label: 'Failed', icon: AlertCircle, color: 'text-red-500' },
};

export default function StudioPage() {
  const router = useRouter();
  const { projects, loading, listProjects, createProject, deleteProject } = useStudio();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listProjects();
  }, [listProjects]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const project = await createProject('Untitled Project');
      router.push(`/dashboard/studio/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Studio</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stitch, trim, and edit your videos with a timeline editor.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Film className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No studio projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create a project to start editing videos.</p>
            <Button className="mt-4" onClick={handleCreate} disabled={creating}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.DRAFT;
            const StatusIcon = config.icon;

            return (
              <Card
                key={project.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/dashboard/studio/${project.id}`)}
              >
                <CardContent className="p-4">
                  {/* Thumbnail */}
                  <div className="mb-3 aspect-video rounded-lg bg-gray-100 overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-gray-900">{project.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className={cn('flex items-center gap-1', config.color)}>
                          <StatusIcon className={cn('h-3 w-3', project.status === 'RENDERING' && 'animate-spin')} />
                          {config.label}
                        </span>
                        {project.totalDuration && (
                          <span>{formatDuration(Math.round(project.totalDuration))}</span>
                        )}
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="ml-2 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Track count */}
                  <div className="mt-2 text-xs text-gray-400">
                    {project.tracks?.length || 0} tracks
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
