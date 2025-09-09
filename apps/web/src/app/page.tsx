'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, MapPin, Phone, MessageCircle, Home, Building } from 'lucide-react';
import { StudentData } from '@/types';
import { apiClient } from '@/lib/api';
import { StudentForm } from '@/components/StudentForm';
import { GroupCreationProgress } from '@/components/GroupCreationProgress';
import { GroupResult } from '@/components/GroupResult';

type FormStep = 'form' | 'oauth' | 'progress' | 'result';

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<FormStep>('form');
  const [jobId, setJobId] = useState<string>('');
  const [groupResult, setGroupResult] = useState<any>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  const handleFormSubmit = async (data: StudentData) => {
    try {
      setStudentData(data);
      setCurrentStep('oauth');
      
      const response = await apiClient.initGroupCreation(data);
      
      // Перенаправляем на OAuth VK
      window.location.href = response.auth_url;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка при инициации создания группы');
      setCurrentStep('form');
    }
  };

  const handleOAuthCallback = (jobId: string) => {
    setJobId(jobId);
    setCurrentStep('progress');
  };

  const handleGroupCreated = (result: any) => {
    setGroupResult(result);
    setCurrentStep('result');
  };

  const handleStartOver = () => {
    setCurrentStep('form');
    setJobId('');
    setGroupResult(null);
    setStudentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-vk-600 rounded-full mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Создание группы ВКонтакте
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Создайте профессиональную группу ВКонтакте для вашего массажного бизнеса 
            всего за несколько кликов
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: 'form', label: 'Заполнение', icon: '📝' },
              { key: 'oauth', label: 'Авторизация', icon: '🔐' },
              { key: 'progress', label: 'Создание', icon: '⚙️' },
              { key: 'result', label: 'Готово', icon: '✅' },
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full text-lg font-semibold ${
                    currentStep === step.key
                      ? 'bg-vk-600 text-white'
                      : ['form', 'oauth', 'progress', 'result'].indexOf(currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep === step.key
                      ? 'text-vk-600'
                      : ['form', 'oauth', 'progress', 'result'].indexOf(currentStep) > index
                      ? 'text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      ['form', 'oauth', 'progress', 'result'].indexOf(currentStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'form' && (
            <StudentForm onSubmit={handleFormSubmit} />
          )}

          {currentStep === 'oauth' && (
            <div className="card text-center">
              <div className="w-16 h-16 bg-vk-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Авторизация ВКонтакте
              </h2>
              <p className="text-gray-600 mb-6">
                Вы будете перенаправлены на страницу авторизации ВКонтакте. 
                Пожалуйста, разрешите доступ к вашим группам для создания сообщества.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Важно:</strong> Если у вас включена двухфакторная аутентификация, 
                  вам потребуется ввести код подтверждения.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'progress' && jobId && (
            <GroupCreationProgress
              jobId={jobId}
              studentData={studentData}
              onComplete={handleGroupCreated}
              onError={() => setCurrentStep('form')}
            />
          )}

          {currentStep === 'result' && groupResult && (
            <GroupResult
              result={groupResult}
              studentData={studentData}
              onStartOver={handleStartOver}
            />
          )}
        </div>

        {/* Features */}
        {currentStep === 'form' && (
          <div className="max-w-6xl mx-auto mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Что вы получите
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Building className="w-8 h-8 text-vk-600" />,
                  title: 'Профессиональная группа',
                  description: 'Красиво оформленная группа с аватаром и обложкой',
                },
                {
                  icon: <MessageCircle className="w-8 h-8 text-vk-600" />,
                  title: 'Готовые посты',
                  description: '8 профессиональных постов с информацией о услугах',
                },
                {
                  icon: <MapPin className="w-8 h-8 text-vk-600" />,
                  title: 'Раздел услуг',
                  description: 'Настроенный маркет с вашими услугами и ценами',
                },
                {
                  icon: <Phone className="w-8 h-8 text-vk-600" />,
                  title: 'Автоответчик',
                  description: 'Автоматические ответы на сообщения клиентов',
                },
                {
                  icon: <Home className="w-8 h-8 text-vk-600" />,
                  title: 'Отзывы',
                  description: 'Готовая тема для сбора отзывов клиентов',
                },
                {
                  icon: <Plus className="w-8 h-8 text-vk-600" />,
                  title: 'За 60 секунд',
                  description: 'Полностью готовая группа за минуту',
                },
              ].map((feature, index) => (
                <div key={index} className="card text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
