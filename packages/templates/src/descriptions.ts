import Handlebars from 'handlebars';
import { StudentData, GroupDescriptionTemplate } from './types';

// Регистрируем хелперы для Handlebars
Handlebars.registerHelper('formatPrice', (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
});

Handlebars.registerHelper('joinTechniques', (techniques: string[]) => {
  return techniques.join(', ');
});

Handlebars.registerHelper('formatPhone', (phone: string) => {
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
});

const homeVisitTemplate = Handlebars.compile(`
🏠 **{{name}} - Массаж на дому в {{city}}**

📍 **Район:** {{area}}
📞 **Телефон:** {{formatPhone phone}}
{{#if telegram}}💬 **Telegram:** {{telegram}}{{/if}}

**Услуги:**
{{#each pricing}}
• {{title}} - {{formatPrice price}}
{{/each}}

**Техники:** {{joinTechniques techniques}}

**Преимущества:**
✅ Выезд на дом в удобное время
✅ Профессиональное оборудование
✅ Индивидуальный подход
✅ Конфиденциальность

**Как проходит сеанс:**
1. Консультация и определение проблемных зон
2. Выбор техники массажа
3. Процедура с использованием качественных масел
4. Рекомендации по уходу

**Показания:**
• Стресс и усталость
• Боли в спине и шее
• Напряжение в мышцах
• Нарушение сна
• Общее укрепление организма

**Противопоказания:**
• Острые воспалительные процессы
• Высокая температура
• Кожные заболевания
• Онкологические заболевания
• Беременность (требуется консультация)

**Запись:** {{formatPhone phone}}{{#if telegram}} или {{telegram}}{{/if}}

#массаж #{{city}} #{{area}} #массажнадом #здоровье #релакс
`);

const officeTemplate = Handlebars.compile(`
🏢 **{{name}} - Массажный кабинет в {{city}}**

📍 **Адрес:** {{address}}
📞 **Телефон:** {{formatPhone phone}}
{{#if telegram}}💬 **Telegram:** {{telegram}}{{/if}}

**Услуги:**
{{#each pricing}}
• {{title}} - {{formatPrice price}}
{{/each}}

**Техники:** {{joinTechniques techniques}}

**Преимущества:**
✅ Уютный кабинет в центре города
✅ Профессиональное оборудование
✅ Индивидуальный подход
✅ Комфортная атмосфера

**Как проходит сеанс:**
1. Консультация и определение проблемных зон
2. Выбор техники массажа
3. Процедура с использованием качественных масел
4. Рекомендации по уходу

**Показания:**
• Стресс и усталость
• Боли в спине и шее
• Напряжение в мышцах
• Нарушение сна
• Общее укрепление организма

**Противопоказания:**
• Острые воспалительные процессы
• Высокая температура
• Кожные заболевания
• Онкологические заболевания
• Беременность (требуется консультация)

**Запись:** {{formatPhone phone}}{{#if telegram}} или {{telegram}}{{/if}}

#массаж #{{city}} #{{area}} #массажныйкабинет #здоровье #релакс
`);

export function generateGroupDescription(studentData: StudentData): GroupDescriptionTemplate {
  const description = studentData.is_home_visit 
    ? homeVisitTemplate(studentData)
    : officeTemplate(studentData);

  return {
    title: `Массаж • ${studentData.city} • ${studentData.name}`,
    description: description.trim(),
    public_category: 1, // Бизнес и услуги
    public_subcategory: 1, // Красота и здоровье
  };
}
