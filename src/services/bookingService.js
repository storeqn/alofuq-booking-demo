import { campaigns, products, capacities, colors } from '../data/catalog.js';
import { validateCustomer, normalizePhone } from '../utils/validation.js';
export function validateBooking(booking) {
  const campaign = campaigns.find(c => c.id === booking.campaignId);
  if (!campaign || !campaign.productIds.includes(booking.productId) || !products.some(p => p.id === booking.productId) || !capacities.includes(booking.capacity) || !colors.some(c => c.id === booking.colorId) || Object.keys(validateCustomer(booking.customer)).length) throw new Error('Invalid reservation');
}
// Replace only this adapter with a server-side integration after approval.
// No network requests or personal-data storage exist in the demo.
export async function submitBooking(booking, { signal } = {}) {
  validateBooking(booking);
  await new Promise((resolve,reject) => {
    const timer = setTimeout(resolve, 1000);
    signal?.addEventListener('abort', () => {clearTimeout(timer);reject(new Error('Cancelled'));}, {once:true});
  });
  return { id: 'AH-' + crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase(), demo: true, phone: normalizePhone(booking.customer.phone) };
}
