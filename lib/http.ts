import { NextResponse } from 'next/server';
export function jsonError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function isDevice(req: Request) { const key = process.env.ESP32_DEVICE_KEY; return !!key && req.headers.get('x-device-key') === key; }
