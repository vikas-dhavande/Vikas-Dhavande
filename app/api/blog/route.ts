import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert({
        ...body,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
