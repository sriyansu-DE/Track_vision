import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase';
import { jsonError } from '@/lib/http';
function authorized(req: Request) { return !!process.env.ADMIN_ACTION_KEY && req.headers.get('x-admin-action') === process.env.ADMIN_ACTION_KEY; }
export async function POST(req: Request) { if(!authorized(req)) return jsonError('Organizer authorization required',401); const body=await req.json(); if(!body.race_id) return jsonError('Race ID required'); const {error}=await serverSupabase().from('races').update({status:'reset'}).eq('id',body.race_id).eq('status','running'); if(error) return jsonError(error.message); return NextResponse.json({ok:true}); }
