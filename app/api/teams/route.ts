import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase';
import { jsonError, isDevice } from '@/lib/http';
export async function GET() { const { data, error } = await serverSupabase().from('teams').select('*').order('team_code'); if(error) return jsonError(error.message,500); return NextResponse.json(data); }
export async function POST(req: Request) { if(!isDevice(req) && req.headers.get('x-admin-action') !== process.env.ADMIN_ACTION_KEY) return jsonError('Unauthorized',401); const body = await req.json(); if(!body.team_code || !body.name) return jsonError('Team code and name are required'); const {data,error}=await serverSupabase().from('teams').insert({team_code:String(body.team_code),name:String(body.name),college:body.college||null}).select().single(); if(error) return jsonError(error.message); return NextResponse.json(data,{status:201}); }
