import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');

    const supabase = getAdminClient();
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }

    const { data: messages, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(messages || []);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('messages')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
