import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getZPayClient, generateOrderId, CREDIT_PACKAGES } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 })
    }

    const { credits } = await request.json()

    // 验证积分包
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.credits === credits)
    if (!creditPackage) {
      return NextResponse.json({ error: '无效的积分包' }, { status: 400 })
    }

    const orderId = generateOrderId()
    const totalCredits = creditPackage.credits + creditPackage.bonus

    // 创建订单记录
    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        totalAmount: creditPackage.price,
        credits: totalCredits,
        status: 'PENDING'
      }
    })

    // 创建支付记录
    const payment = await prisma.payment.create({
      data: {
        userId: payload.userId,
        orderId,
        amount: creditPackage.price,
        credits: totalCredits,
        status: 'PENDING',
        paymentMethod: 'zpay'
      }
    })

    // 更新订单关联支付ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: payment.id }
    })

    // 调用Z-Pay创建支付
    const zpayClient = getZPayClient()
    const paymentResult = await zpayClient.createPayment({
      orderId,
      amount: creditPackage.price,
      credits: totalCredits,
      userId: payload.userId,
      notifyUrl: `${process.env.NEXTAUTH_URL}/api/payment/notify`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment/success`
    })

    if (paymentResult.success) {
      // 更新支付记录
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          zpayOrderId: paymentResult.orderId
        }
      })

      return NextResponse.json({
        success: true,
        payUrl: paymentResult.payUrl,
        orderId: payment.orderId
      })
    } else {
      // 更新为失败状态
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' }
      })

      return NextResponse.json({
        success: false,
        error: paymentResult.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: '创建支付失败，请稍后重试' },
      { status: 500 }
    )
  }
}

