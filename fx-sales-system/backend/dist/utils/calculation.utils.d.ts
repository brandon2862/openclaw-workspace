/**
 * 计算报价选项
 * @param agentSxCost Agent SX Cost
 * @returns 三个选项的汇率
 */
export declare function calculateRates(agentSxCost: number): {
    option1: number;
    option2: number;
    option3: number;
};
/**
 * 计算转换金额和利润
 * @param sourceAmount 源金额
 * @param selectedRate 选择的汇率
 * @param agentSxCost Agent SX Cost
 * @returns 转换金额和利润
 */
export declare function calculateAmountAndPnl(sourceAmount: number, selectedRate: number, agentSxCost: number): {
    convertedAmount: number;
    pnl: number;
};
/**
 * 根据选项获取汇率
 * @param agentSxCost Agent SX Cost
 * @param selectedOption 选择的选项 (1-4)
 * @param manualRate 手动输入的汇率（仅当选项为4时使用）
 * @returns 选择的汇率
 */
export declare function getSelectedRate(agentSxCost: number, selectedOption: number, manualRate?: number): number;
/**
 * 格式化货币金额
 * @param amount 金额
 * @param currency 货币代码
 * @returns 格式化后的字符串
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * 格式化汇率
 * @param rate 汇率
 * @returns 格式化后的字符串
 */
export declare function formatRate(rate: number): string;
//# sourceMappingURL=calculation.utils.d.ts.map