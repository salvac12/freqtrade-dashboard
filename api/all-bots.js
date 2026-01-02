// Vercel Serverless Function para obtener datos de todos los bots
module.exports = async function handler(req, res) {
  const VPS_IP = process.env.VPS_IP;
  const USERNAME = process.env.FREQTRADE_USERNAME;
  const PASSWORD = process.env.FREQTRADE_PASSWORD;
  
  // Validar que las variables de entorno estén configuradas
  if (!VPS_IP || !USERNAME || !PASSWORD) {
    return res.status(500).json({ 
      error: 'Variables de entorno no configuradas. Configura VPS_IP, FREQTRADE_USERNAME y FREQTRADE_PASSWORD en Vercel.' 
    });
  }
  
  const bots = [
    { name: "BollingerV1", exchange: "Kraken", port: 8080 },
    { name: "NFI X5", exchange: "Binance", port: 8081 },
    { name: "Supertrend", exchange: "OKX", port: 8082 },
    { name: "Strategy005", exchange: "Binance", port: 8083 }
  ];

  try {
    // Obtener datos de todos los bots en paralelo
    const botDataPromises = bots.map(async (bot) => {
      try {
        const baseUrl = `http://${VPS_IP}:${bot.port}`;
        
        // Obtener token
        const authResponse = await fetch(`${baseUrl}/api/v1/token/login`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')
          }
        });

        if (!authResponse.ok) {
          throw new Error(`Error de autenticación: ${authResponse.status}`);
        }

        const authData = await authResponse.json();
        const token = authData.access_token;

        if (!token) {
          throw new Error('No se obtuvo token de autenticación');
        }

        // Obtener trades y status
        const [tradesResponse, statusResponse] = await Promise.all([
          fetch(`${baseUrl}/api/v1/trades`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${baseUrl}/api/v1/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!tradesResponse.ok || !statusResponse.ok) {
          throw new Error('Error obteniendo datos del bot');
        }

        const trades = await tradesResponse.json();
        const status = await statusResponse.json();

        // Procesar datos (mismo código que en bots.js)
        const tradesList = Array.isArray(trades) ? trades : (trades.trades || []);
        const openTrades = tradesList.filter(t => t.is_open);
        const closedTrades = tradesList.filter(t => !t.is_open);

        const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_abs || 0), 0);
        const totalProfitPct = closedTrades.reduce((sum, t) => sum + (t.profit_pct || 0), 0);

        const winningTrades = closedTrades.filter(t => (t.profit_abs || 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.profit_abs || 0) < 0);
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length * 100) : 0;

        // Calcular días corriendo
        let daysRunning = 1;
        if (closedTrades.length > 0) {
          const firstTrade = closedTrades[closedTrades.length - 1];
          if (firstTrade.close_date) {
            const firstDate = new Date(firstTrade.close_date);
            const now = new Date();
            const diffTime = Math.abs(now - firstDate);
            daysRunning = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
        } else if (openTrades.length > 0) {
          const oldestTrade = openTrades.reduce((oldest, current) => {
            const oldestDate = new Date(oldest.open_date || 0);
            const currentDate = new Date(current.open_date || 0);
            return currentDate < oldestDate ? current : oldest;
          });
          if (oldestTrade.open_date) {
            const firstDate = new Date(oldestTrade.open_date);
            const now = new Date();
            const diffTime = Math.abs(now - firstDate);
            daysRunning = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          }
        }

        const dailyReturn = daysRunning > 0 ? totalProfitPct / daysRunning : 0;
        const annualizedReturn = dailyReturn * 365;

        return {
          bot: bot.name,
          exchange: bot.exchange,
          status: status.state || 'unknown',
          trades: {
            total: tradesList.length,
            open: openTrades.length,
            closed: closedTrades.length,
            list: tradesList
          },
          summary: {
            totalProfit,
            totalProfitPct,
            winRate,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            annualizedReturn,
            daysRunning
          }
        };
      } catch (error) {
        return {
          bot: bot.name,
          exchange: bot.exchange,
          status: 'error',
          error: error.message
        };
      }
    });

    const botData = await Promise.all(botDataPromises);

    // Calcular estadísticas globales
    const totalTrades = botData.reduce((sum, b) => sum + (b.trades?.total || 0), 0);
    const totalOpen = botData.reduce((sum, b) => sum + (b.trades?.open || 0), 0);
    const totalClosed = botData.reduce((sum, b) => sum + (b.trades?.closed || 0), 0);
    const totalProfit = botData.reduce((sum, b) => sum + (b.summary?.totalProfit || 0), 0);
    const totalProfitPct = botData.reduce((sum, b) => sum + (b.summary?.totalProfitPct || 0), 0);
    const totalWinning = botData.reduce((sum, b) => sum + (b.summary?.winningTrades || 0), 0);
    const totalLosing = botData.reduce((sum, b) => sum + (b.summary?.losingTrades || 0), 0);
    const globalWinRate = totalClosed > 0 ? (totalWinning / totalClosed * 100) : 0;

    return res.status(200).json({
      bots: botData,
      global: {
        totalTrades,
        totalOpen,
        totalClosed,
        totalProfit,
        totalProfitPct,
        globalWinRate,
        totalWinning,
        totalLosing
      }
    });

  } catch (error) {
    console.error('Error obteniendo datos de todos los bots:', error);
    return res.status(500).json({ error: error.message });
  }
}

