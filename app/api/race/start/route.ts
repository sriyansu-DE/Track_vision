import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase';
import { jsonError } from '@/lib/http';
function authorized(req: Request) { return !!process.env.ADMIN_ACTION_KEY && req.headers.get('x-admin-action') === process.env.ADMIN_ACTION_KEY; }
export async function POST(req: Request) { if(!authorized(req)) return jsonError('Organizer authorization required',401); const body=await req.json(); if(!body.team_id) return jsonError('Select a team first'); const db=serverSupabase(); const {data:active}=await db.from('races').select('id').eq('status','running').maybeSingle(); if(active) return jsonError('A race is already running'); const {data,error}=await db.from('races').insert({team_id:body.team_id,status:'running',started_at:new Date().toISOString(),current_checkpoint:0}).select().single(); if(error) return jsonError(error.message); return NextResponse.json(data,{status:201}); }
