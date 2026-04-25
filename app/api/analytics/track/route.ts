import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_name, path, session_id, user_agent, referrer, metadata } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!event_name) missing.push('event_name');
    if (!path) missing.push('path');
    if (!session_id) missing.push('session_id');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name,
        path,
        session_id,
        user_id: user?.id || null,
        user_agent,
        referrer,
        metadata: metadata || {},
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ANALYTICS_TRACK_ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
