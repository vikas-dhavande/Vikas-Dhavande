import { NextRequest, NextResponse } from 'next/server';
import { getBlogs, createBlog } from '@/lib/blogs';

export async function GET() {
  try {
    const blogs = await getBlogs();
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields when publishing
    if (body.published_at) {
      const { title, slug, content } = body;
      if (!title?.trim() || !slug?.trim() || !content?.trim()) {
        return NextResponse.json(
          { error: 'title, slug, and content are required when publishing a post' },
          { status: 400 }
        );
      }
    }

    const blog = await createBlog({
      ...body,
      author_name: body.author_name || 'Admin',
    });

    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
