import { NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, businessName } = body || {}
    if (!to || !businessName) {
      return NextResponse.json({ ok: false, error: 'Missing to or businessName' }, { status: 400 })
    }

    // Send confirmation to submitter
    await emailService.sendEmail({
      to,
      subject: `We received your GunsmithLocal submission: ${businessName}`,
      html: `<p>Thanks for submitting <strong>${businessName}</strong>. We'll verify your FFL and notify you when approved.</p>`,
    })

    // Notify admin if configured
    const adminTo = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
    if (adminTo) {
      await emailService.sendEmail({
        to: adminTo,
        subject: `New business submission: ${businessName}`,
        html: `<p>A new business submission has been received for <strong>${businessName}</strong>.</p>`
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Failed to send' }, { status: 500 })
  }
}


