'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, MapPin, Phone, MessageCircle, Home, Building } from 'lucide-react';
import { StudentData } from '@/types';

interface StudentFormProps {
  onSubmit: (data: StudentData) => void;
}

const TECHNIQUES = [
  'классический',
  'шейно-воротниковая',
  'спортивный',
  'антицеллюлитный',
  'релакс',
  'лечебный',
  'тайский',
  'точечный',
];

const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
];

export function StudentForm({ onSubmit }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentData>({
    defaultValues: {
      name: '',
      city: '',
      area: '',
      phone: '',
      telegram: '',
      techniques: ['классический'],
      pricing: [
        { title: 'Классический массаж 60 мин', price: 2500 },
      ],
      is_home_visit: true,
      address: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pricing',
  });

  const isHomeVisit = watch('is_home_visit');

  const onFormSubmit = async (data: StudentData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPricingItem = () => {
    append({ title: '', price: 0 });
  };

  const removePricingItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Информация о вас
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              Имя и фамилия *
            </label>
            <input
              {...register('name', { required: 'Введите ваше имя' })}
              className="input"
              placeholder="Иван Петров"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              Город *
            </label>
            <select
              {...register('city', { required: 'Выберите город' })}
              className="input"
            >
              <option value="">Выберите город</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              Район *
            </label>
            <input
              {...register('area', { required: 'Введите район' })}
              className="input"
              placeholder="Центральный"
            />
            {errors.area && (
              <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              Телефон *
            </label>
            <input
              {...register('phone', { 
                required: 'Введите телефон',
                pattern: {
                  value: /^\+7\d{10}$/,
                  message: 'Введите телефон в формате +7XXXXXXXXXX'
                }
              })}
              className="input"
              placeholder="+7 900 000-00-00"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="label">
              Telegram (необязательно)
            </label>
            <input
              {...register('telegram')}
              className="input"
              placeholder="@username"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Техники массажа
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TECHNIQUES.map(technique => (
            <label key={technique} className="flex items-center">
              <input
                type="checkbox"
                value={technique}
                {...register('techniques')}
                className="rounded border-gray-300 text-vk-600 focus:ring-vk-500"
              />
              <span className="ml-2 text-sm text-gray-700">{technique}</span>
            </label>
          ))}
        </div>
        {errors.techniques && (
          <p className="mt-2 text-sm text-red-600">Выберите хотя бы одну технику</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Услуги и цены
        </h2>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="label">
                  Название услуги
                </label>
                <input
                  {...register(`pricing.${index}.title` as const, {
                    required: 'Введите название услуги'
                  })}
                  className="input"
                  placeholder="Классический массаж 60 мин"
                />
              </div>
              <div className="w-32">
                <label className="label">
                  Цена (₽)
                </label>
                <input
                  type="number"
                  {...register(`pricing.${index}.price` as const, {
                    required: 'Введите цену',
                    min: { value: 1, message: 'Цена должна быть больше 0' }
                  })}
                  className="input"
                  placeholder="2500"
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePricingItem(index)}
                  className="btn-secondary p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPricingItem}
            className="btn-secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить услугу
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Место работы
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="true"
                {...register('is_home_visit')}
                className="text-vk-600 focus:ring-vk-500"
              />
              <span className="ml-2 flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Выезд на дом
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="false"
                {...register('is_home_visit')}
                className="text-vk-600 focus:ring-vk-500"
              />
              <span className="ml-2 flex items-center">
                <Building className="w-4 h-4 mr-1" />
                Прием в кабинете
              </span>
            </label>
          </div>

          {!isHomeVisit && (
            <div>
              <label className="label">
                Адрес кабинета
              </label>
              <input
                {...register('address')}
                className="input"
                placeholder="ул. Примерная, д. 1, оф. 5"
              />
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-vk px-8 py-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Создаем группу...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Создать группу ВКонтакте
            </>
          )}
        </button>
      </div>
    </form>
  );
}
