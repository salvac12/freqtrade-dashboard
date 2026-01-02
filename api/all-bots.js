// Vercel Serverless Function para obtener datos de todos los bots
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const VPS_IP = process.env.VPS_IP;
  const USERNAME = process.env.FREQTRADE_USERNAME;
  const PASSWORD = process.env.FREQTRADE_PASSWORD;
  
  // Validar que las variables de entorno estén configuradas
  if (!VPS_IP || !USERNAME || !PASSWORD) {
    console.error('Variables de entorno faltantes:', { VPS_IP: !!VPS_IP, USERNAME: !!USERNAME, PASSWORD: !!PASSWORD });
    return res.status(500).json({ 
      error: 'Variables de entorno no configuradas. Configura VPS_IP, FREQTRADE_USERNAME y FREQTRADE_PASSWORD en Vercel.',
      debug: { hasVPS_IP: !!VPS_IP, hasUSERNAME: !!USERNAME, hasPASSWORD: !!PASSWORD }
    });
  }
  
  // Log de depuración (solo en desarrollo)
  if (process.env.VERCEL_ENV === 'development') {
    console.log('Variables de entorno:', { VPS_IP, USERNAME: USERNAME ? '***' : 'missing', PASSWORD: PASSWORD ? '***' : 'missing' });
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
        
        // Obtener token - usar autenticación básica HTTP
        // Asegurarse de que USERNAME y PASSWORD no tengan espacios
        const cleanUsername = (USERNAME || '').trim();
        const cleanPassword = (PASSWORD || '').trim();
        const authString = Buffer.from(`${cleanUsername}:${cleanPassword}`).toString('base64');
        
        let authResponse;
        try {
          authResponse = await fetch(`${baseUrl}/api/v1/token/login`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${authString}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
        } catch (fetchError) {
          throw new Error(`Error de conexión: ${fetchError.message}`);
        }

        if (!authResponse.ok) {
          const errorText = await authResponse.text().catch(() => '');
          console.error(`Auth error for ${bot.name}:`, authResponse.status, errorText);
          throw new Error(`Error de autenticación: ${authResponse.status} - ${errorText.substring(0, 100)}`);
        }

        const authData = await authResponse.json();
        const token = authData.access_token;

        if (!token) {
          throw new Error('No se obtuvo token de autenticación');
        }

        // Obtener trades y status
        const [tradesResponse, statusResponse] = await Promise.all([
          fetch(`${baseUrl}/api/v1/trades`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          }),
          fetch(`${baseUrl}/api/v1/status`, {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          })
        ]);

        if (!tradesResponse.ok || !statusResponse.ok) {
          throw new Error('Error obteniendo datos del bot');
        }

        let tradesData, statusData;
        try {
          tradesData = await tradesResponse.json();
          statusData = await statusResponse.json();
        } catch (parseError) {
          throw new Error(`Error parseando respuesta: ${parseError.message}`);
        }

        // Procesar datos de trades
        const tradesList = Array.isArray(tradesData) ? tradesData : (tradesData.trades || []);
        const openTrades = tradesList.filter(t => t && t.is_open);
        const closedTrades = tradesList.filter(t => t && !t.is_open);
        
        // Obtener estado del bot - el endpoint /status puede devolver un array vacío
        // En ese caso, asumimos que el bot está corriendo si podemos obtener datos
        let botState = 'unknown';
        if (Array.isArray(statusData)) {
          // Si es un array vacío, el bot probablemente está corriendo
          botState = statusData.length > 0 ? (statusData[0]?.state || 'running') : 'running';
        } else if (typeof statusData === 'object' && statusData !== null) {
          botState = statusData.state || statusData.bot_state || statusData.status || 'running';
        } else {
          // Si no podemos determinar el estado, asumimos que está corriendo si hay datos
          botState = 'running';
        }

        const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_abs || 0), 0);
        const totalProfitPct = closedTrades.reduce((sum, t) => sum + (t.profit_pct || 0), 0);
        
        // Calcular capital invertido (suma de stake_amount de todos los trades cerrados)
        const totalInvested = closedTrades.reduce((sum, t) => sum + (t.stake_amount || 0), 0);
        
        // Obtener la moneda stake (EUR, USDT, etc.) del primer trade o usar 'EUR' por defecto
        const stakeCurrency = closedTrades.length > 0 
          ? (closedTrades[0].stake_currency || closedTrades[0].quote_currency || 'EUR')
          : (openTrades.length > 0 
            ? (openTrades[0].stake_currency || openTrades[0].quote_currency || 'EUR')
            : 'EUR');

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
          status: botState === 'unknown' ? 'running' : botState,
          trades: {
            total: tradesList.length,
            open: openTrades.length,
            closed: closedTrades.length,
            list: tradesList
          },
          summary: {
            totalProfit,
            totalProfitPct,
            totalInvested,
            stakeCurrency,
            winRate,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            annualizedReturn,
            daysRunning
          }
        };
      } catch (error) {
        console.error(`Error en ${bot.name}:`, error.message);
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
