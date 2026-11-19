import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase';
export async function GET() { const {data,error}=await serverSupabase().from('races').select('id,status,started_at,finished_at,duration_ms,current_checkpoint,teams(id,team_code,name,college)').in('status',['completed','running']).order('duration_ms',{ascending:true,nullsFirst:false}).limit(50); if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json(data); }
