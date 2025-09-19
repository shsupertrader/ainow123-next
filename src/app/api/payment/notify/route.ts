import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getZPayClient } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证回调签名
    const zpayClient = getZPayClient()
    const isValid = zpayClient.verifyCallback(body)
    
    if (!isValid) {
      console.error('Invalid payment callback signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const { out_trade_no, trade_status, total_fee } = body

    // 查找支付记录
    const payment = await prisma.payment.findUnique({
      where: { orderId: out_trade_no },
      include: { user: true }
    })

    if (!payment) {
      console.error(`Payment not found: ${out_trade_no}`)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // 检查是否已经处理过
    if (payment.status === 'PAID') {
      return NextResponse.json({ message: 'Already processed' })
    }

    // 验证金额
    if (parseFloat(total_fee) !== payment.amount) {
      console.error(`Amount mismatch: expected ${payment.amount}, got ${total_fee}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 支付成功，更新记录
      await prisma.$transaction(async (tx) => {
        // 更新支付状态
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            zpayTradeNo: body.trade_no
          }
        })

        // 更新订单状态（如果存在关联订单）
        const relatedOrder = await tx.order.findFirst({
          where: { paymentId: payment.id }
        })
        
        if (relatedOrder) {
          await tx.order.update({
            where: { id: relatedOrder.id },
            data: { status: 'PAID' }
          })
        }

        // 增加用户积分
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            credits: {
              increment: payment.credits
            }
          }
        })
      })

      console.log(`Payment successful for order: ${out_trade_no}`)
      return NextResponse.json({ message: 'success' })
    } else {
      // 支付失败
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })

      // 更新关联订单状态（如果存在）
      const relatedOrder = await prisma.order.findFirst({
        where: { paymentId: payment.id }
      })
      
      if (relatedOrder) {
        await prisma.order.update({
          where: { id: relatedOrder.id },
          data: { status: 'CANCELLED' }
        })
      }

      console.log(`Payment failed for order: ${out_trade_no}`)
      return NextResponse.json({ message: 'Payment failed' })
    }
  } catch (error) {
    console.error('Payment notify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

