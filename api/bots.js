// Vercel Serverless Function para obtener datos de los bots
// Esta función actúa como proxy entre el dashboard y el VPS
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Configuración del VPS (desde variables de entorno)
  const VPS_IP = process.env.VPS_IP;
  const USERNAME = process.env.FREQTRADE_USERNAME;
  const PASSWORD = process.env.FREQTRADE_PASSWORD;
  
  // Validar que las variables de entorno estén configuradas
  if (!VPS_IP || !USERNAME || !PASSWORD) {
    return res.status(500).json({ 
      error: 'Variables de entorno no configuradas. Configura VPS_IP, FREQTRADE_USERNAME y FREQTRADE_PASSWORD en Vercel.' 
    });
  }
  
  // Configuración de bots
  const bots = [
    { name: "BollingerV1", exchange: "Kraken", port: 8080 },
    { name: "NFI X5", exchange: "Binance", port: 8081 },
    { name: "Supertrend", exchange: "OKX", port: 8082 },
    { name: "Strategy005", exchange: "Binance", port: 8083 }
  ];

  // Obtener el bot específico del query
  const { bot } = req.query;
  
  if (!bot || !bots.find(b => b.name === bot)) {
    return res.status(400).json({ error: 'Bot no válido' });
  }

  const botConfig = bots.find(b => b.name === bot);
  const baseUrl = `http://${VPS_IP}:${botConfig.port}`;

  try {
    // Obtener token de autenticación
    const authString = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    const authResponse = await fetch(`${baseUrl}/api/v1/token/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text().catch(() => '');
      throw new Error(`Error de autenticación: ${authResponse.status} - ${errorText.substring(0, 100)}`);
    }

    const authData = await authResponse.json();
    const token = authData.access_token;

    if (!token) {
      throw new Error('No se obtuvo token de autenticación');
    }

    // Obtener trades y status en paralelo
    const [tradesResponse, statusResponse] = await Promise.all([
      fetch(`${baseUrl}/api/v1/trades`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }),
      fetch(`${baseUrl}/api/v1/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      })
    ]);

    if (!tradesResponse.ok || !statusResponse.ok) {
      throw new Error('Error obteniendo datos del bot');
    }

    const trades = await tradesResponse.json();
    const status = await statusResponse.json();

    // Procesar datos
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

    return res.status(200).json({
      bot: botConfig.name,
      exchange: botConfig.exchange,
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
    });

  } catch (error) {
    console.error(`Error obteniendo datos de ${botConfig.name}:`, error);
    return res.status(500).json({
      error: error.message,
      bot: botConfig.name,
      exchange: botConfig.exchange,
      status: 'error'
    });
  }
}
