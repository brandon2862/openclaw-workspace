/**
 * 计算报价选项
 * @param agentSxCost Agent SX Cost
 * @returns 三个选项的汇率
 */
export function calculateRates(agentSxCost: number): {
  option1: number;
  option2: number;
  option3: number;
} {
  return {
    option1: parseFloat((agentSxCost - 0.05).toFixed(4)),
    option2: parseFloat((agentSxCost - 0.08).toFixed(4)),
    option3: parseFloat((agentSxCost - 0.10).toFixed(4))
  };
}

/**
 * 计算转换金额和利润
 * @param sourceAmount 源金额
 * @param selectedRate 选择的汇率
 * @param agentSxCost Agent SX Cost
 * @returns 转换金额和利润
 */
export function calculateAmountAndPnl(
  sourceAmount: number,
  selectedRate: number,
  agentSxCost: number
): {
  convertedAmount: number;
  pnl: number;
} {
  // MYR = RMB / Sell Rate
  const convertedAmount = parseFloat((sourceAmount / selectedRate).toFixed(2));
  
  // P&L = (Agent SX Cost - Sell Rate) × Source Amount
  const pnl = parseFloat(((agentSxCost - selectedRate) * sourceAmount).toFixed(2));
  
  return { convertedAmount, pnl };
}

/**
 * 根据选项获取汇率
 * @param agentSxCost Agent SX Cost
 * @param selectedOption 选择的选项 (1-4)
 * @param manualRate 手动输入的汇率（仅当选项为4时使用）
 * @returns 选择的汇率
 */
export function getSelectedRate(
  agentSxCost: number,
  selectedOption: number,
  manualRate?: number
): number {
  const rates = calculateRates(agentSxCost);
  
  switch (selectedOption) {
    case 1:
      return rates.option1;
    case 2:
      return rates.option2;
    case 3:
      return rates.option3;
    case 4:
      if (!manualRate) {
        throw new Error('Manual rate is required for option 4');
      }
      return manualRate;
    default:
      throw new Error(`Invalid option: ${selectedOption}`);
  }
}

/**
 * 格式化货币金额
 * @param amount 金额
 * @param currency 货币代码
 * @returns 格式化后的字符串
 */
export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * 格式化汇率
 * @param rate 汇率
 * @returns 格式化后的字符串
 */
export function formatRate(rate: number): string {
  return rate.toFixed(4);
}