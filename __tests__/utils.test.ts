import { calculateDiscount, formatPrice, calculateTax } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('calculateDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      const originalPrice = 100
      const discountPercent = 10
      const result = calculateDiscount(originalPrice, discountPercent)
      expect(result).toBe(90)
    })

    it('should calculate 50% discount correctly', () => {
      const originalPrice = 200
      const discountPercent = 50
      const result = calculateDiscount(originalPrice, discountPercent)
      expect(result).toBe(100)
    })

    it('should return original price when discount is 0', () => {
      const originalPrice = 150
      const discountPercent = 0
      const result = calculateDiscount(originalPrice, discountPercent)
      expect(result).toBe(150)
    })

    it('should handle decimal prices', () => {
      const originalPrice = 99.99
      const discountPercent = 20
      const result = calculateDiscount(originalPrice, discountPercent)
      expect(result).toBeCloseTo(79.99, 2)
    })
  })

  describe('formatPrice', () => {
    it('should format price with GHS currency', () => {
      const price = 100
      const result = formatPrice(price)
      expect(result).toContain('100')
      expect(result).toMatch(/GH[₵S]/)
    })

    it('should format decimal prices correctly', () => {
      const price = 45.99
      const result = formatPrice(price)
      expect(result).toContain('45.99')
      expect(result).toMatch(/GH[₵S]/)
    })

    it('should format large prices with proper decimals', () => {
      const price = 1234.56
      const result = formatPrice(price)
      expect(result).toContain('1')
      expect(result).toContain('234')
      expect(result).toContain('56')
    })
  })

  describe('calculateTax', () => {
    it('should calculate 15% tax correctly', () => {
      const amount = 100
      const taxRate = 15
      const result = calculateTax(amount, taxRate)
      expect(result).toBe(15)
    })

    it('should calculate tax for decimal amounts', () => {
      const amount = 99.99
      const taxRate = 10
      const result = calculateTax(amount, taxRate)
      expect(result).toBeCloseTo(10, 2)
    })

    it('should return 0 when tax rate is 0', () => {
      const amount = 100
      const taxRate = 0
      const result = calculateTax(amount, taxRate)
      expect(result).toBe(0)
    })
  })
})
