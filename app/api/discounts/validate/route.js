import { NextResponse } from 'next/server';
import { evaluateDiscount } from '@/lib/discounts';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    const subtotalFils = Math.max(0, Math.round(+subtotal) || 0);
    const result = await evaluateDiscount(code, subtotalFils);
    if (result.error) return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    return NextResponse.json({ valid: true, discount: result.discount });
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
