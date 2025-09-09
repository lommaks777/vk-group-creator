'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { GroupStatus, StudentData } from '@/types';
import { apiClient } from '@/lib/api';

interface GroupCreationProgressProps {
  jobId: string;
  studentData: StudentData | null;
  onComplete: (result: any) => void;
  onError: () => void;
}

const PROGRESS_STEPS = [
  { key: 'group_created', label: 'Создание группы', icon: '🏢' },
  { key: 'avatar_uploaded', label: 'Загрузка аватара', icon: '🖼️' },
  { key: 'cover_uploaded', label: 'Загрузка обложки', icon: '🎨' },
  { key: 'posts_published', label: 'Публикация постов', icon: '📝' },
  { key: 'reviews_topic_created', label: 'Создание темы отзывов', icon: '💬' },
  { key: 'market_enabled', label: 'Настройка маркета', icon: '🛒' },
  { key: 'services_added', label: 'Добавление услуг', icon: '⚙️' },
  { key: 'address_added', label: 'Добавление адреса', icon: '📍' },
  { key: 'auto_responder_enabled', label: 'Настройка автоответчика', icon: '🤖' },
];

export function GroupCreationProgress({ 
  jobId, 
  studentData, 
  onComplete, 
  onError 
}: GroupCreationProgressProps) {
  const [status, setStatus] = useState<GroupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await apiClient.getGroupStatus(jobId);
        setStatus(response);
        setIsLoading(false);

        if (response.status === 'completed') {
          onComplete(response.result);
        } else if (response.status === 'failed') {
          onError();
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setIsLoading(false);
        onError();
      }
    };

    // Начинаем опрос сразу
    pollStatus();

    // Опрашиваем каждые 2 секунды
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [jobId, onComplete, onError]);

  if (isLoading) {
    return (
      <div className="card text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vk-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Загружаем статус...
        </h2>
        <p className="text-gray-600">
          Получаем информацию о создании группы
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="card text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ошибка загрузки
        </h2>
        <p className="text-gray-600">
          Не удалось получить статус создания группы
        </p>
      </div>
    );
  }

  const completedSteps = Object.values(status.progress).filter(Boolean).length;
  const totalSteps = Object.keys(status.progress).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepStatus = (stepKey: string) => {
    if (status.progress[stepKey as keyof typeof status.progress]) {
      return 'completed';
    }
    
    // Проверяем, является ли этот шаг текущим
    const stepIndex = PROGRESS_STEPS.findIndex(step => step.key === stepKey);
    const completedStepIndex = PROGRESS_STEPS.findIndex(step => 
      status.progress[step.key as keyof typeof status.progress]
    );
    
    if (stepIndex === completedStepIndex + 1) {
      return 'current';
    }
    
    return 'pending';
  };

  return (
    <div className="card">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-vk-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Создание группы в процессе
        </h2>
        <p className="text-gray-600">
          Пожалуйста, подождите. Это займет около 30-60 секунд.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {PROGRESS_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          
          return (
            <div key={step.key} className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                stepStatus === 'completed' 
                  ? 'bg-green-500 text-white' 
                  : stepStatus === 'current'
                  ? 'bg-vk-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepStatus === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : stepStatus === 'current' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{step.icon}</span>
                  <span className={`font-medium ${
                    stepStatus === 'completed' 
                      ? 'text-green-600' 
                      : stepStatus === 'current'
                      ? 'text-vk-600'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                
                {/* Дополнительная информация для некоторых шагов */}
                {step.key === 'posts_published' && status.progress.posts_published > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Опубликовано {status.progress.posts_published} из {status.progress.total_posts} постов
                  </p>
                )}
                
                {step.key === 'services_added' && status.progress.services_added > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Добавлено {status.progress.services_added} из {status.progress.total_services} услуг
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {status.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800 font-medium">Ошибка:</span>
          </div>
          <p className="text-red-700 mt-1">{status.error}</p>
        </div>
      )}

      {/* Estimated Time */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <Clock className="w-4 h-4 inline mr-1" />
        Осталось примерно {Math.max(0, 60 - Math.round(progressPercentage * 0.6))} секунд
      </div>
    </div>
  );
}
