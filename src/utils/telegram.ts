const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendOrderToTelegram = async (order: {
  sim_number: string;
  sim_price: string;
  customer_name: string;
  cccd: string;
  contact_phone: string;
  address: string;
  note: string;
}): Promise<boolean> => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram config missing');
    return false;
  }

  const message = `
🛒 *ĐƠN HÀNG MỚI - SIM QUỐC DÂN*
━━━━━━━━━━━━━━━━━━━━
📱 *Số SIM:* \`${order.sim_number}\`
💰 *Giá:* ${order.sim_price}
━━━━━━━━━━━━━━━━━━━━
👤 *Khách hàng:* ${order.customer_name}
🪪 *CCCD:* ${order.cccd}
📞 *SĐT liên hệ:* ${order.contact_phone}
📍 *Địa chỉ:* ${order.address}
📝 *Ghi chú:* ${order.note || 'Không có'}
━━━━━━━━━━━━━━━━━━━━
🕐 *Thời gian:* ${new Date().toLocaleString('vi-VN')}
  `.trim();

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error('Telegram error:', err);
    return false;
  }
};
