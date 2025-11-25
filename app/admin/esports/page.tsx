'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function EsportsSettingsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Verify authentication
    fetch('/api/admin/verify')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          loadSettings();
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadSettings = () => {
    fetch('/api/esports')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsOpen(data.data.is_open);
          setAnnouncement(data.data.announcement || '');
        }
      })
      .catch(console.error);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/esports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOpen,
          announcement,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings: ' + data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Esports Registration Settings</CardTitle>
            <CardDescription>
              Manage esports registration status and announcements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Esports Registration Open</span>
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                When unchecked, esports registration will be disabled
              </p>
            </div>

            <div>
              <Label htmlFor="announcement">Announcement Message</Label>
              <Input
                id="announcement"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Esports matches will be held in OC on scheduled dates."
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will be displayed to users
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

