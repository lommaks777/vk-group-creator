'use client';

import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, QrCode, Share2, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StudentData } from '@/types';

interface GroupResultProps {
  result: {
    group_id: number;
    screen_name: string;
    url: string;
  };
  studentData: StudentData | null;
  onStartOver: () => void;
}

export function GroupResult({ result, studentData, onStartOver }: GroupResultProps) {
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Скопировано в буфер обмена');
    } catch (error) {
      toast.error('Не удалось скопировать');
    }
  };

  const shareGroup = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Массаж • ${studentData?.city} • ${studentData?.name}`,
          text: `Профессиональный массаж в ${studentData?.city}. Запись: ${studentData?.phone}`,
          url: result.url,
        });
      } catch (error) {
        // Пользователь отменил шаринг
      }
    } else {
      copyToClipboard(result.url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="card text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Группа создана успешно!
        </h2>
        <p className="text-gray-600 text-lg">
          Ваша группа ВКонтакте готова к работе
        </p>
      </div>

      {/* Group Info */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Информация о группе
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Название</p>
              <p className="text-gray-600">Массаж • {studentData?.city} • {studentData?.name}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">ID группы</p>
              <p className="text-gray-600">{result.group_id}</p>
            </div>
            <button
              onClick={() => copyToClipboard(result.group_id.toString())}
              className="btn-secondary p-2"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Ссылка на группу</p>
              <p className="text-gray-600 break-all">{result.url}</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => copyToClipboard(result.url)}
                className="btn-secondary p-2"
                title="Копировать ссылку"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary p-2"
                title="Открыть группу"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Что дальше?
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => window.open(result.url, '_blank')}
            className="btn-vk flex items-center justify-center"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Открыть группу
          </button>
          
          <button
            onClick={shareGroup}
            className="btn-secondary flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Поделиться
          </button>
          
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-secondary flex items-center justify-center"
          >
            <QrCode className="w-5 h-5 mr-2" />
            {showQR ? 'Скрыть QR' : 'Показать QR'}
          </button>
          
          <button
            onClick={onStartOver}
            className="btn-secondary flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Создать еще группу
          </button>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="card text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            QR-код для быстрого доступа
          </h3>
          <div className="bg-white p-4 rounded-lg inline-block">
            {/* Здесь можно добавить генерацию QR-кода */}
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Отсканируйте QR-код для быстрого перехода к группе
          </p>
        </div>
      )}

      {/* Checklist */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Чек-лист: что уже готово
        </h3>
        
        <div className="space-y-3">
          {[
            '✅ Группа создана и настроена',
            '✅ Загружен аватар и обложка',
            '✅ Опубликованы стартовые посты',
            '✅ Создана тема для отзывов',
            '✅ Настроен раздел услуг',
            '✅ Добавлены ваши услуги и цены',
            '✅ Включен автоответчик',
            '✅ Настроены сообщения',
          ].map((item, index) => (
            <div key={index} className="flex items-center text-gray-700">
              <span className="mr-3">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Рекомендации для развития
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              📌 Закрепите важный пост
            </h4>
            <p className="text-blue-800 text-sm">
              Закрепите пост с прайс-листом или контактами в верхней части группы
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">
              👥 Пригласите друзей
            </h4>
            <p className="text-green-800 text-sm">
              Пригласите друзей и знакомых в группу для первых подписчиков
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">
              ⭐ Соберите первые отзывы
            </h4>
            <p className="text-yellow-800 text-sm">
              Попросите довольных клиентов оставить отзывы в соответствующей теме
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">
              📱 Публикуйте регулярно
            </h4>
            <p className="text-purple-800 text-sm">
              Система автоматически опубликует остальные посты в течение 2 недель
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
