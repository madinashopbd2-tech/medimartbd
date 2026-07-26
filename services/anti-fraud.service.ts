/**
 * Anti-Fraud, Spam Protection & Courier Risk Management Service
 * Designed specifically for Bangladesh Cash on Delivery (COD) E-commerce
 */

export interface RiskEvaluationInput {
  phone: string;
  customerName: string;
  address: string;
  district: string;
  upazila: string;
  totalAmount: number;
  ipAddress?: string;
  existingOrdersCount?: number;
  recentOrdersFromPhone?: number; // count in last 24h
  recentOrdersFromIp?: number;    // count in last 30m
  isBlacklisted?: boolean;
}

export interface RiskEvaluationResult {
  isBlocked: boolean;
  blockReason?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number; // 0 to 100 (Higher is riskier)
  reasons: string[];
  requiresOtp: boolean;
  courierSuccessRate: number; // Simulated or real check e.g. 85%
}

// Banned sequential / fake / test phone patterns
const FAKE_PHONE_PATTERNS = [
  /^01[3-9]00000000$/,
  /^01[3-9]11111111$/,
  /^01[3-9]22222222$/,
  /^01[3-9]33333333$/,
  /^01[3-9]44444444$/,
  /^01[3-9]55555555$/,
  /^01[3-9]66666666$/,
  /^01[3-9]77777777$/,
  /^01[3-9]88888888$/,
  /^01[3-9]99999999$/,
  /^01234567890$/,
  /^01987654321$/,
];

// Simulated Courier API lookup database (Steadfast/Pathao historical delivery success)
const COURIER_HISTORICAL_DATABASE: Record<string, { successRate: number; totalDelivered: Int32Array | number; totalReturned: number }> = {
  '01711122334': { successRate: 92, totalDelivered: 23, totalReturned: 2 },
  '01812345678': { successRate: 40, totalDelivered: 4, totalReturned: 6 }, // High risk customer
  '01999887766': { successRate: 35, totalDelivered: 3, totalReturned: 5 }, // High risk customer
};

export class AntiFraudService {
  /**
   * Validates BD Phone format (/^01[3-9]\d{8}$/)
   */
  static isValidBdPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');
    const bdRegex = /^01[3-9]\d{8}$/;
    return bdRegex.test(cleanPhone);
  }

  /**
   * Check if phone is fake or sequential
   */
  static isFakeOrSequentialPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');
    
    // Check regex pattern list
    for (const pattern of FAKE_PHONE_PATTERNS) {
      if (pattern.test(cleanPhone)) return true;
    }

    // Check repeated single digit e.g. 01777777777
    const digits = cleanPhone.slice(3); // after 017
    if (/^(\d)\1{7}$/.test(digits)) return true;

    return false;
  }

  /**
   * Sanitizes delivery address and checks minimum length
   */
  static validateAddress(address: string): { isValid: boolean; reason?: string } {
    const trimmed = address.trim();
    if (trimmed.length < 15) {
      return {
        isValid: false,
        reason: 'Full address must be at least 15 characters long to ensure proper courier delivery.',
      };
    }
    // Check for gibberish like 'asdfasdfasdfasdf' or 'test test test test'
    if (/^(.)\1{10,}/.test(trimmed) || /^(test|asdf|qwerty)\s*/i.test(trimmed)) {
      return {
        isValid: false,
        reason: 'Please enter a valid, complete house number, road, and area name.',
      };
    }
    return { isValid: true };
  }

  /**
   * Mock Steadfast / Pathao Courier API background check for customer risk profile
   */
  static async checkCourierRiskScore(phone: string): Promise<number> {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');
    
    if (COURIER_HISTORICAL_DATABASE[cleanPhone]) {
      return COURIER_HISTORICAL_DATABASE[cleanPhone].successRate;
    }

    // Hash phone to deterministically generate realistic historical rate between 60% and 98%
    let hash = 0;
    for (let i = 0; i < cleanPhone.length; i++) {
      hash = (hash << 5) - hash + cleanPhone.charCodeAt(i);
      hash |= 0;
    }
    const simulatedRate = 60 + Math.abs(hash % 38); // 60% to 98%
    return simulatedRate;
  }

  /**
   * Comprehensive Risk Evaluation Engine
   */
  static async evaluateRisk(input: RiskEvaluationInput): Promise<RiskEvaluationResult> {
    const reasons: string[] = [];
    let riskScore = 0;
    let isBlocked = false;
    let blockReason = '';

    const cleanPhone = input.phone.replace(/\s+/g, '').replace(/^(\+88|88)/, '');

    // 1. Blacklist Check
    if (input.isBlacklisted) {
      return {
        isBlocked: true,
        blockReason: 'Ordering is currently unavailable for this account. Please contact support via WhatsApp.',
        riskLevel: 'HIGH',
        riskScore: 100,
        reasons: ['Phone number or IP is explicitly blacklisted by admin'],
        requiresOtp: false,
        courierSuccessRate: 0,
      };
    }

    // 2. Strict Phone Regex Check
    if (!this.isValidBdPhone(cleanPhone)) {
      return {
        isBlocked: true,
        blockReason: 'Invalid Bangladeshi phone number. Must be 11 digits starting with 013-019.',
        riskLevel: 'HIGH',
        riskScore: 100,
        reasons: ['Invalid BD Phone Format'],
        requiresOtp: false,
        courierSuccessRate: 0,
      };
    }

    // 3. Fake / Sequential Number Check
    if (this.isFakeOrSequentialPhone(cleanPhone)) {
      return {
        isBlocked: true,
        blockReason: 'Sequential or fake phone number detected. Please enter your real active phone number.',
        riskLevel: 'HIGH',
        riskScore: 100,
        reasons: ['Fake / Sequential phone pattern detected'],
        requiresOtp: false,
        courierSuccessRate: 0,
      };
    }

    // 4. Address Check
    const addrCheck = this.validateAddress(input.address);
    if (!addrCheck.isValid) {
      return {
        isBlocked: true,
        blockReason: addrCheck.reason || 'Invalid address format.',
        riskLevel: 'MEDIUM',
        riskScore: 70,
        reasons: [addrCheck.reason || 'Address too short or invalid'],
        requiresOtp: false,
        courierSuccessRate: 0,
      };
    }

    // 5. Rate Limit & Duplicate Order Engine (24h Phone limit / 30m IP limit)
    if (input.recentOrdersFromPhone && input.recentOrdersFromPhone >= 1) {
      riskScore += 40;
      reasons.push('Unconfirmed order already placed from this phone number in past 24 hours');
    }

    if (input.recentOrdersFromIp && input.recentOrdersFromIp >= 2) {
      riskScore += 35;
      reasons.push('Multiple checkouts submitted from this IP address in last 30 minutes');
    }

    // 6. Courier Risk Scoring (Steadfast / Pathao historical rate)
    const courierSuccessRate = await this.checkCourierRiskScore(cleanPhone);
    if (courierSuccessRate < 50) {
      riskScore += 50;
      reasons.push(`Historical courier delivery success rate is low (${courierSuccessRate}%)`);
    } else if (courierSuccessRate < 70) {
      riskScore += 20;
      reasons.push(`Moderate courier return history (${courierSuccessRate}% success rate)`);
    }

    // 7. Order Amount Threshold Check
    if (input.totalAmount > 3000) {
      riskScore += 25;
      reasons.push(`High order value (৳${input.totalAmount} exceeds ৳3,000 threshold)`);
    }

    // Categorize Risk Level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (riskScore >= 50) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 25) {
      riskLevel = 'MEDIUM';
    }

    // Conditional Smart OTP: Required if High Risk OR order value > ৳3000 OR repeat attempt
    const requiresOtp = riskLevel === 'HIGH' || input.totalAmount > 3000;

    return {
      isBlocked: false,
      riskLevel,
      riskScore: Math.min(riskScore, 100),
      reasons,
      requiresOtp,
      courierSuccessRate,
    };
  }
}
