import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { normaliseRange, aggregateEvents } from '@/lib/analytics-utils';

export async function GET(req: NextRequest) {
  try {
    const rawRange = req.nextUrl.searchParams.get('range');
    const { range, startDate } = normaliseRange(rawRange);

    const supabase = await createClient();

    // Fetch all events in range with path and session_id
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('path, session_id, created_at')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const stats = aggregateEvents(events ?? []);

    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
