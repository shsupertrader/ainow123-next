import crypto from 'crypto'
import axios from 'axios'

export interface ZPayConfig {
  merchantId: string
  secretKey: string
  apiUrl: string
}

export interface PaymentParams {
  orderId: string
  amount: number
  credits: number
  userId: string
  notifyUrl: string
  returnUrl: string
}

export interface PaymentResult {
  success: boolean
  payUrl?: string
  orderId?: string
  error?: string
}

export class ZPayClient {
  private config: ZPayConfig

  constructor(config: ZPayConfig) {
    this.config = config
  }

  // 生成签名
  private generateSign(params: Record<string, any>): string {
    // 按key排序
    const sortedKeys = Object.keys(params).sort()
    const signString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.config.secretKey}`

    return crypto.createHash('md5').update(signString).digest('hex').toUpperCase()
  }

  // 创建支付订单
  async createPayment(params: PaymentParams): Promise<PaymentResult> {
    const paymentData = {
      merchant_id: this.config.merchantId,
      out_trade_no: params.orderId,
      total_fee: params.amount,
      body: `充值${params.credits}积分`,
      notify_url: params.notifyUrl,
      return_url: params.returnUrl,
      timestamp: Math.floor(Date.now() / 1000).toString()
    }

    // 生成签名
    const paymentDataWithSign = {
      ...paymentData,
      sign: this.generateSign(paymentData)
    }

    try {
      const response = await axios.post(`${this.config.apiUrl}/api/pay/create`, paymentDataWithSign, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      if (response.data.code === 200) {
        return {
          success: true,
          payUrl: response.data.data.pay_url,
          orderId: response.data.data.trade_no
        }
      } else {
        return {
          success: false,
          error: response.data.message || '创建支付订单失败'
        }
      }
    } catch (error: any) {
      console.error('Z-Pay API Error:', error.message)
      return {
        success: false,
        error: `支付服务异常: ${error.message}`
      }
    }
  }

  // 验证支付回调
  verifyCallback(params: Record<string, any>): boolean {
    const sign = params.sign
    delete params.sign

    const expectedSign = this.generateSign(params)
    return sign === expectedSign
  }

  // 查询支付状态
  async queryPayment(outTradeNo: string): Promise<any> {
    const queryData = {
      merchant_id: this.config.merchantId,
      out_trade_no: outTradeNo,
      timestamp: Math.floor(Date.now() / 1000).toString()
    }

    const queryDataWithSign = {
      ...queryData,
      sign: this.generateSign(queryData)
    }

    try {
      const response = await axios.post(`${this.config.apiUrl}/api/pay/query`, queryDataWithSign, {
        timeout: 10000
      })

      return response.data
    } catch (error: any) {
      console.error('Query payment error:', error.message)
      throw new Error(`查询支付状态失败: ${error.message}`)
    }
  }
}

// 获取默认的支付客户端
export function getZPayClient(): ZPayClient {
  return new ZPayClient({
    merchantId: process.env.ZPAY_MERCHANT_ID || '',
    secretKey: process.env.ZPAY_SECRET_KEY || '',
    apiUrl: process.env.ZPAY_API_URL || 'https://api.z-pay.cn'
  })
}

// 积分价格配置
export const CREDIT_PACKAGES = [
  { credits: 100, price: 10, bonus: 0 },
  { credits: 500, price: 45, bonus: 50 },
  { credits: 1000, price: 80, bonus: 200 },
  { credits: 2000, price: 150, bonus: 500 },
  { credits: 5000, price: 300, bonus: 1500 }
]

// 生成订单ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `ORDER_${timestamp}_${random}`
}
