import Handlebars from 'handlebars';
import { StudentData, MarketItemTemplate } from './types';

// Регистрируем хелперы
Handlebars.registerHelper('formatPrice', (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
});

Handlebars.registerHelper('formatPhone', (phone: string) => {
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
});

export function generateMarketItems(studentData: StudentData): MarketItemTemplate[] {
  return studentData.pricing.map(item => ({
    title: item.title,
    description: Handlebars.compile(`
**{{title}}**

**Описание услуги:**
Профессиональный массаж от опытного специалиста {{name}}.

**Что входит:**
✅ Консультация и диагностика
✅ Профессиональный массаж
✅ Качественные масла
✅ Рекомендации по уходу

**Техники:** {{joinTechniques techniques}}

**Продолжительность:** {{#if (contains title "30")}}30 минут{{else if (contains title "45")}}45 минут{{else if (contains title "60")}}60 минут{{else if (contains title "90")}}90 минут{{else}}60 минут{{/if}}

**Стоимость:** {{formatPrice price}}

**Запись:** {{formatPhone phone}}{{#if telegram}} или {{telegram}}{{/if}}

**Преимущества:**
• Индивидуальный подход
• Профессиональное оборудование
• {{#if is_home_visit}}Выезд на дом{{else}}Уютный кабинет{{/if}}
• Конфиденциальность

#массаж #{{city}} #{{area}} #здоровье #релакс
    `)({ ...studentData, ...item }),
    price: item.price,
    category_id: 1, // Красота и здоровье
  }));
}
