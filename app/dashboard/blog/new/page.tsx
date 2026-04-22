'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import BlogEditor from '@/components/blog/BlogEditor';
import { ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail_url: '',
    is_published: false,
  });

  const handleSave = async () => {
    if (!blogData.title || !blogData.slug || !blogData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blogData,
          published_at: blogData.is_published ? new Date().toISOString() : null,
        }),
      });

      if (res.ok) {
        toast.success('Blog post created successfully');
        router.push('/dashboard/blog');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/blog">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">New Blog Post</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Post'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Write your post content here.</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogEditor
                onChange={(content) => setBlogData({ ...blogData, content })}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Post Title"
                  value={blogData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    setBlogData({ ...blogData, title, slug });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-slug"
                  value={blogData.slug}
                  onChange={(e) => setBlogData({ ...blogData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  placeholder="https://..."
                  value={blogData.thumbnail_url}
                  onChange={(e) => setBlogData({ ...blogData, thumbnail_url: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Label htmlFor="publish">Publish Immediately</Label>
                <Switch
                  id="publish"
                  checked={blogData.is_published}
                  onCheckedChange={(checked) => setBlogData({ ...blogData, is_published: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
