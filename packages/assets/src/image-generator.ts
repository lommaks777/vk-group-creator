import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import sharp from 'sharp';
import { StudentData, AvatarOptions, CoverOptions } from './types';

export class ImageGenerator {
  private defaultAvatarOptions: AvatarOptions = {
    width: 200,
    height: 200,
    backgroundColor: '#4A90E2',
    textColor: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    showPhone: true,
    showTelegram: false,
  };

  private defaultCoverOptions: CoverOptions = {
    width: 1200,
    height: 300,
    backgroundColor: '#2C3E50',
    textColor: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Arial, sans-serif',
    showTechniques: true,
    showPricing: false,
  };

  async generateAvatar(studentData: StudentData, options?: Partial<AvatarOptions>): Promise<Buffer> {
    const opts = { ...this.defaultAvatarOptions, ...options };
    
    const canvas = createCanvas(opts.width, opts.height);
    const ctx = canvas.getContext('2d');

    // Фон
    ctx.fillStyle = opts.backgroundColor;
    ctx.fillRect(0, 0, opts.width, opts.height);

    // Градиент для красоты
    const gradient = ctx.createRadialGradient(
      opts.width / 2, opts.height / 2, 0,
      opts.width / 2, opts.height / 2, opts.width / 2
    );
    gradient.addColorStop(0, opts.backgroundColor);
    gradient.addColorStop(1, this.darkenColor(opts.backgroundColor, 0.3));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, opts.width, opts.height);

    // Настройка текста
    ctx.fillStyle = opts.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Имя
    ctx.font = `bold ${opts.fontSize}px ${opts.fontFamily}`;
    ctx.fillText(studentData.name, opts.width / 2, opts.height / 2 - 20);

    // Город и район
    ctx.font = `${opts.fontSize * 0.7}px ${opts.fontFamily}`;
    ctx.fillText(`${studentData.city}, ${studentData.area}`, opts.width / 2, opts.height / 2 + 10);

    // Телефон (если нужно)
    if (opts.showPhone) {
      ctx.font = `${opts.fontSize * 0.6}px ${opts.fontFamily}`;
      ctx.fillText(this.formatPhone(studentData.phone), opts.width / 2, opts.height / 2 + 35);
    }

    // Telegram (если нужно)
    if (opts.showTelegram && studentData.telegram) {
      ctx.font = `${opts.fontSize * 0.6}px ${opts.fontFamily}`;
      ctx.fillText(studentData.telegram, opts.width / 2, opts.height / 2 + 55);
    }

    // Декоративные элементы
    this.addDecorativeElements(ctx, opts.width, opts.height, opts.textColor);

    // Конвертируем в Buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Оптимизируем с помощью Sharp
    return await sharp(buffer)
      .png({ quality: 90, compressionLevel: 6 })
      .toBuffer();
  }

  async generateCover(studentData: StudentData, options?: Partial<CoverOptions>): Promise<Buffer> {
    const opts = { ...this.defaultCoverOptions, ...options };
    
    const canvas = createCanvas(opts.width, opts.height);
    const ctx = canvas.getContext('2d');

    // Фон с градиентом
    const gradient = ctx.createLinearGradient(0, 0, opts.width, opts.height);
    gradient.addColorStop(0, opts.backgroundColor);
    gradient.addColorStop(1, this.darkenColor(opts.backgroundColor, 0.2));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, opts.width, opts.height);

    // Настройка текста
    ctx.fillStyle = opts.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Заголовок
    ctx.font = `bold ${opts.fontSize}px ${opts.fontFamily}`;
    ctx.fillText(`Массаж • ${studentData.city} • ${studentData.name}`, 40, 40);

    // Подзаголовок
    ctx.font = `${opts.fontSize * 0.7}px ${opts.fontFamily}`;
    ctx.fillText(`Район: ${studentData.area}`, 40, 90);

    // Техники (если нужно)
    if (opts.showTechniques) {
      ctx.font = `${opts.fontSize * 0.6}px ${opts.fontFamily}`;
      const techniques = studentData.techniques.join(', ');
      ctx.fillText(`Техники: ${techniques}`, 40, 130);
    }

    // Цены (если нужно)
    if (opts.showPricing && studentData.pricing.length > 0) {
      ctx.font = `${opts.fontSize * 0.6}px ${opts.fontFamily}`;
      const firstPrice = studentData.pricing[0];
      ctx.fillText(`От ${this.formatPrice(firstPrice.price)}`, 40, 170);
    }

    // Контактная информация
    ctx.font = `${opts.fontSize * 0.6}px ${opts.fontFamily}`;
    ctx.fillText(`📞 ${this.formatPhone(studentData.phone)}`, 40, 210);
    
    if (studentData.telegram) {
      ctx.fillText(`💬 ${studentData.telegram}`, 40, 240);
    }

    // Декоративные элементы
    this.addCoverDecorativeElements(ctx, opts.width, opts.height, opts.textColor);

    // Конвертируем в Buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Оптимизируем с помощью Sharp
    return await sharp(buffer)
      .png({ quality: 90, compressionLevel: 6 })
      .toBuffer();
  }

  private addDecorativeElements(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
    // Круглые декоративные элементы
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    
    // Верхний левый угол
    ctx.beginPath();
    ctx.arc(30, 30, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Нижний правый угол
    ctx.beginPath();
    ctx.arc(width - 30, height - 30, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }

  private addCoverDecorativeElements(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
    // Декоративные линии
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.2;
    
    // Горизонтальные линии
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(width - 200, 50 + i * 20);
      ctx.lineTo(width - 50, 50 + i * 20);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
    
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  private formatPhone(phone: string): string {
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price);
  }
}
