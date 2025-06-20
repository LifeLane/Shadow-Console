
'use server';
/**
 * @fileOverview Service for fetching data from PolygonScan API.
 */

const POLYGONSCAN_API_BASE_URL = 'https://api.polygonscan.com/api';

// Known contract addresses on Polygon PoS
const USDT_POLYGON_CONTRACT = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f';
const WBTC_POLYGON_CONTRACT = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6';

interface PolygonTransaction {
  hash: string;
  from: string;
  to: string;
  value: string; // Value in Wei for native token, or token amount for ERC20
  timeStamp: string;
  tokenSymbol?: string;
}

/**
 * Determines a relevant contract address based on the trading symbol.
 * @param tradingSymbol e.g., BTCUSDT, ETHUSDT
 * @returns Contract address string or null if not applicable.
 */
function getRelevantContractAddress(tradingSymbol: string): string | null {
  const symbolUpper = tradingSymbol.toUpperCase();
  if (symbolUpper.includes('BTC')) {
    return WBTC_POLYGON_CONTRACT; // Wrapped BTC on Polygon
  }
  if (symbolUpper.includes('USDT')) {
    return USDT_POLYGON_CONTRACT; // USDT on Polygon
  }
  // Add more mappings as needed for other assets
  return null; 
}

/**
 * Fetches recent transactions for a relevant asset on Polygon.
 * @param tradingSymbol The trading symbol (e.g., BTCUSDT) to infer the asset.
 * @returns A string summarizing recent transactions or an error/status message.
 */
export async function fetchRecentTransactions(tradingSymbol: string): Promise<string> {
  const apiKey = process.env.POLYGONSCAN_API_KEY;
  if (!apiKey) {
    return "PolygonScan API key not configured. Wallet transaction data unavailable.";
  }

  const contractAddress = getRelevantContractAddress(tradingSymbol);
  if (!contractAddress) {
    return `No direct Polygon contract mapping for asset derived from ${tradingSymbol}. Transaction data focused on major assets.`;
  }
  
  const assetName = tradingSymbol.includes('BTC') ? 'WBTC' : 'USDT'; // Simplified

  try {
    // Fetching ERC20 token transfers for the contract
    const response = await fetch(
      `${POLYGONSCAN_API_BASE_URL}?module=account&action=tokentx&contractaddress=${contractAddress}&page=1&offset=5&sort=desc&apikey=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`PolygonScan API error for ${assetName} (${contractAddress}): ${response.status}`, errorData);
      return `Error fetching ${assetName} transactions from PolygonScan: ${errorData.message || response.statusText}.`;
    }

    const data = await response.json();

    if (data.status === "0") { // API returned an error in the 'message' field
        console.error(`PolygonScan API message for ${assetName} (${contractAddress}): ${data.message}`);
        if (data.message === "No transactions found") {
             return `No recent ${assetName} transactions found on Polygon for contract ${contractAddress}.`;
        }
        return `PolygonScan API error for ${assetName}: ${data.message}.`;
    }
    
    const transactions: PolygonTransaction[] = data.result;

    if (!transactions || transactions.length === 0) {
      return `No recent ${assetName} transactions found on Polygon for contract ${contractAddress}.`;
    }

    const summary = transactions
      .slice(0, 2) // Summarize the latest 2 transactions
      .map(tx => {
        const direction = tx.to.toLowerCase() === contractAddress.toLowerCase() ? 'to contract' : 'from contract';
        const valueNormalized = parseFloat(tx.value) / (10**(tx.tokenSymbol === 'WBTC' ? 8 : 6)); // WBTC 8 decimals, USDT 6
        return `Tx: ${valueNormalized.toFixed(2)} ${tx.tokenSymbol || assetName} (${direction}) at ${new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString()}`;
      })
      .join('; ');
    
    return `Recent ${assetName} activity on Polygon: ${summary || 'No significant movements.'}`;
  } catch (error) {
    console.error(`Failed to fetch ${assetName} transactions from PolygonScan:`, error);
    return `Exception while fetching ${assetName} transaction data. Check server logs.`;
  }
}
