'use client';

import { useState } from 'react';
import {
  ExternalLink,
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  Link2,
  Settings,
  Globe,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Platform {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  accountName?: string;
  connectedDate?: string;
  icon: string;
  color: string;
}

const platforms: Platform[] = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short form vertical videos up to 10 minutes',
    connected: false,
    icon: '🎵',
    color: 'from-pink-500 to-red-500',
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    description: 'Short form videos on the YouTube platform',
    connected: false,
    icon: '▶️',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    description: 'Short form videos for Instagram audience',
    connected: false,
    icon: '📸',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'facebook',
    name: 'Facebook Reels',
    description: 'Reach your Facebook audience with short videos',
    connected: false,
    icon: '👥',
    color: 'from-blue-500 to-blue-600',
  },
];

interface QueueItem {
  id: string;
  title: string;
  platform: string;
  scheduledAt: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  thumbnailUrl?: string;
}

interface PublishedItem {
  id: string;
  title: string;
  platform: string;
  publishedAt: string;
  views: number;
  likes: number;
  postUrl: string;
}

export default function PublishingPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Mock data for demo
  const queue: QueueItem[] = [];
  const published: PublishedItem[] = [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publishing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your social accounts to publish videos directly from Aveo.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSettingsOpen(!settingsOpen)}>
          <Settings className="mr-2 h-4 w-4" />
          Publishing Settings
        </Button>
      </div>

      {/* Connected Platforms */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Connected Platforms</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => (
            <Card key={platform.id} className="group relative overflow-hidden transition-all hover:shadow-md">
              {/* Top color accent */}
              <div className={cn('h-1.5 w-full bg-gradient-to-r', platform.color)} />

              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{platform.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {platform.connected ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-xs font-medium text-green-700">{platform.accountName}</p>
                          <p className="text-xs text-gray-400">Connected {platform.connectedDate}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 text-gray-300" />
                        <span className="text-xs text-gray-500">Not connected</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {platform.connected ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Manage
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full">
                      <Link2 className="mr-2 h-3.5 w-3.5" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Publishing Queue */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Publishing Queue
                </CardTitle>
                <CardDescription>Videos scheduled for publishing</CardDescription>
              </div>
              <Badge variant="secondary">{queue.length} scheduled</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                          <Globe className="h-3 w-3" />
                          <span>{item.platform}</span>
                          <span>·</span>
                          <Calendar className="h-3 w-3" />
                          <span>{item.scheduledAt}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.status === 'published' ? 'success' :
                        item.status === 'failed' ? 'error' :
                        item.status === 'publishing' ? 'default' :
                        'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Clock className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No scheduled posts</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect a platform and schedule videos to see them here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Publishing History */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Publishing History
            </CardTitle>
            <CardDescription>Recently published posts</CardDescription>
          </CardHeader>
          <CardContent>
            {published.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {published.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                          <span>{item.platform}</span>
                          <span>{item.publishedAt}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={item.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      View Post
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <Globe className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">No published posts yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your publishing history will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Publishing Settings Panel */}
      {settingsOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
            <CardDescription>Configure default publish times and stagger settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Default Publish Times */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Default Publish Times</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {['Morning (9:00 AM)', 'Afternoon (1:00 PM)', 'Evening (6:00 PM)', 'Night (9:00 PM)'].map((time, i) => (
                    <label
                      key={time}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={i < 2}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stagger Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cross Platform Stagger</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Add a delay between publishing to different platforms to avoid appearing spammy.
                </p>
                <div className="flex items-center gap-3">
                  <select className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>No delay</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                  <span className="text-xs text-gray-500">between each platform</span>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 pt-4">
                <Button size="sm">Save Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
