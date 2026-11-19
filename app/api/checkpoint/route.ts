import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase';
import { jsonError, isDevice } from '@/lib/http';
export async function POST(req: Request) {
  if(!isDevice(req)) return jsonError('Invalid device key',401);
  const body=await req.json(); const checkpoint=Number(body.checkpoint);
  if(!Number.isInteger(checkpoint)||checkpoint<1) return jsonError('checkpoint must be a positive integer');
  const db=serverSupabase(); const {data:race,error:raceErr}=await db.from('races').select('*').eq('status','running').maybeSingle();
  if(raceErr) return jsonError(raceErr.message,500); if(!race) return jsonError('No active race',409);
  if(checkpoint<=race.current_checkpoint) return NextResponse.json({ok:true,ignored:true,message:'Duplicate or out-of-order checkpoint'});
  const now=new Date(); const finished=body.finish===true;
  const {error}=await db.from('checkpoint_events').insert({race_id:race.id,checkpoint_number:checkpoint,occurred_at:now.toISOString(),device_id:body.device_id||'esp32'});
  if(error) return jsonError(error.message,500);
  const duration=now.getTime()-new Date(race.started_at).getTime();
  const update:Record<string,unknown>={current_checkpoint:checkpoint}; if(finished){update.status='completed';update.finished_at=now.toISOString();update.duration_ms=duration;}
  const {error:updateErr}=await db.from('races').update(update).eq('id',race.id); if(updateErr) return jsonError(updateErr.message,500);
  return NextResponse.json({ok:true,race_id:race.id,checkpoint,duration_ms:duration,finished});
}
