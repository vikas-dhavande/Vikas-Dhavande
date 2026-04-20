'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import BlogEditor from '@/components/blog/BlogEditor';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blogData, setBlogData] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail_url: '',
    is_published: false,
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch('/api/blog'); // Get all and filter for now, or create a specific GET /api/blog/[id]
        const blogs = await res.json();
        const blog = blogs.find((b: any) => b.id === id);
        
        if (blog) {
          setBlogData({
            title: blog.title,
            slug: blog.slug,
            content: blog.content,
            thumbnail_url: blog.thumbnail_url || '',
            is_published: !!blog.published_at,
          });
        } else {
          toast.error('Blog post not found');
          router.push('/dashboard/blog');
        }
      } catch (error) {
        toast.error('Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blogData,
          published_at: blogData.is_published ? (blogData.is_published ? new Date().toISOString() : null) : null,
        }),
      });

      if (res.ok) {
        toast.success('Blog post updated successfully');
        router.push('/dashboard/blog');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/blog">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Update Post'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Edit post content.</CardDescription>
            </CardHeader>
            <CardContent>
              <BlogEditor
                initialContent={blogData.content}
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
                  value={blogData.title}
                  onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={blogData.slug}
                  onChange={(e) => setBlogData({ ...blogData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={blogData.thumbnail_url}
                  onChange={(e) => setBlogData({ ...blogData, thumbnail_url: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Label htmlFor="publish">Published</Label>
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
