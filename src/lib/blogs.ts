import { getSupabase } from './supabase';
import { Blog } from '../types';

export async function getBlogs() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  return data as Blog[];
}

export async function getBlogBySlug(slug: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    return null;
  }

  return data as Blog;
}

export async function createBlog(blog: Partial<Blog>) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('blogs')
    .insert([blog])
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw error;
  }

  return data as Blog;
}
