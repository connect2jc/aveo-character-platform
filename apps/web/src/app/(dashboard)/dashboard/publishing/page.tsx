'use client';

import { ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const platforms = [
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Short form vertical videos up to 10 minutes',
    connected: false,
    icon: '🎵',
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts',
    description: 'Short form videos on the YouTube platform',
    connected: false,
    icon: '▶️',
  },
  {
    id: 'instagram',
    name: 'Instagram Reels',
    description: 'Short form videos for Instagram audience',
    connected: false,
    icon: '📸',
  },
];

export default function PublishingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publishing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your social accounts to publish videos directly from Aveo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {platforms.map((platform) => (
          <Card key={platform.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                    <CardDescription>{platform.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {platform.connected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="success">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 text-gray-300" />
                      <Badge variant="secondary">Not Connected</Badge>
                    </>
                  )}
                </div>
                <Button variant={platform.connected ? 'outline' : 'default'} size="sm">
                  {platform.connected ? 'Manage' : 'Connect'}
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Schedule</CardTitle>
          <CardDescription>
            Set your default publishing times for each platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm text-gray-500">
              Connect at least one platform to configure your publishing schedule.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
