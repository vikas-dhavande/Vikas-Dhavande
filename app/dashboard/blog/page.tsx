'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Blog } from '@/types';

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Blog deleted successfully');
        setBlogs(blogs.filter(b => b.id !== id));
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting blog');
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">Create, edit, and publish your blog posts.</p>
        </div>
        <Link href="/dashboard/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>A list of all your blog posts and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">No blog posts found.</TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell className="font-medium">
                      {blog.title}
                      <p className="text-xs text-muted-foreground font-normal">{blog.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.published_at ? "default" : "secondary"}>
                        {blog.published_at ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/blog/${blog.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {blog.published_at && (
                          <Link href={`/blog/${blog.slug}`} target="_blank">
                            <Button variant="outline" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
