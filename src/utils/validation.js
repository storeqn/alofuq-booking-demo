export function normalizeDigits(value) {
  return value.replace(/[٠-٩۰-۹]/g, char => String('٠١٢٣٤٥٦٧٨٩'.includes(char) ? '٠١٢٣٤٥٦٧٨٩'.indexOf(char) : '۰۱۲۳۴۵۶۷۸۹'.indexOf(char)));
}
export function normalizePhone(value) {
  return normalizeDigits(value).replace(/[\s()-]/g,'').replace(/^(?:\+964|00964|964)0?/, '0');
}
export function validateCustomer(customer) {
  const errors = {};
  const words = customer.name.trim().split(/\s+/);
  if (words.length < 3 || words.some(word => !/^[\p{L}\p{M}][\p{L}\p{M}'’\-]+$/u.test(word))) errors.name = 'يرجى إدخال الاسم الثلاثي';
  if (!/^07[3-9]\d{8}$/.test(normalizePhone(customer.phone))) errors.phone = 'يرجى إدخال رقم هاتف صحيح';
  if (customer.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email.trim())) errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
  return errors;
}
