export function phoneVisual(product, color, className = '') {
  return `<div class="phone-visual ${className}" style="--phone-color:${color?.hex || '#693a49'}"><img src="${product.image}" width="240" height="340" alt="رسم تصوري لـ ${product.name}" loading="lazy" decoding="async"><span class="phone-tint" aria-hidden="true"></span></div>`;
}
