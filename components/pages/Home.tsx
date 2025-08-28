import React from 'react';
import { Progress } from '../ui/progress';
import { Brain, BarChart3, MessageCircle, Award, Star, Sparkles, Zap, Target, Users, TrendingUp } from 'lucide-react';

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const goTests = () => onNavigate && onNavigate('tests');

  return (
    <>
      {/* Futuristic Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-futuristic">
              Подготовка к ЕНТ
            </h1>
            <p className="max-w-3xl mx-auto text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              Готовьтесь, проходите тесты и улучшайте результат с помощью 
              <span className="text-blue-400 font-semibold"> умных инструментов</span> и 
              <span className="text-purple-400 font-semibold"> ИИ‑ассистента</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={goTests} 
              className="btn-futuristic text-lg px-8 py-4 group"
              aria-label="Начать тест"
            >
              <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Начать тест
            </button>
            <button 
              onClick={goTests} 
              className="futuristic-card px-8 py-4 text-lg font-semibold hover:bg-blue-500/20 transition-all duration-300"
              aria-label="Узнать больше"
            >
              <Target className="h-5 w-5 mr-2" />
              Узнать больше
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-24">
        {/* Programs Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-futuristic">Программы и возможности</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Инновационные инструменты для эффективной подготовки к экзаменам
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                icon: <MessageCircle className="h-8 w-8" />, 
                title: 'ИИ Чат‑бот ассистент', 
                desc: 'Персональная поддержка по предметам и разбор ошибок.', 
                bullets: ['Умные подсказки и объяснения', 'Генерация практических заданий', 'История диалогов и прогресс'],
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: <BarChart3 className="h-8 w-8" />, 
                title: 'Аналитика и прогресс', 
                desc: 'Детальные метрики, интерактивные графики, персональные рекомендации.', 
                bullets: ['Средний балл и динамика роста', 'Анализ слабых тем', 'Индивидуальные планы подготовки'],
                gradient: 'from-purple-500 to-pink-500'
              },
              { 
                icon: <Brain className="h-8 w-8" />, 
                title: 'Генератор тестов', 
                desc: 'Создание персональных наборов вопросов с ИИ.', 
                bullets: ['Адаптивные тесты по темам', 'Умные таймеры и режимы', 'Сохранение и анализ сессий'],
                gradient: 'from-green-500 to-emerald-500'
              },
            ].map((p, i) => (
              <article key={i} className="group">
                <div className="futuristic-card p-8 h-full hover:scale-105 transition-all duration-500">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`size-12 rounded-xl bg-gradient-to-r ${p.gradient} p-0.5`}>
                      <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                        {p.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {p.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">
                    <a className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group-hover:gap-3" href="#learn">
                      Подробнее 
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Students' Results */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-futuristic">Результаты учеников</h2>
            <p className="text-xl text-gray-400">Реальные достижения наших студентов</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Айбек', city: 'Алматы', a: 62, b: 89, avatar: 'A' },
              { name: 'Дана', city: 'Астана', a: 55, b: 84, avatar: 'Д' },
              { name: 'Меруерт', city: 'Шымкент', a: 71, b: 92, avatar: 'М' },
            ].map((s, i) => (
              <div key={i} className="futuristic-card p-6 group hover:scale-105 transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {s.avatar}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{s.name}</div>
                    <div className="text-gray-400 text-sm">{s.city}</div>
                    <div className="text-gray-500 text-xs">11 класс</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Было: {s.a}</span>
                    <span className="text-green-400">Стало: {s.b}</span>
                  </div>
                  <div className="progress-futuristic h-2 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${(s.b / 100) * 100}%` }} 
                    />
                  </div>
                  <p className="text-sm text-gray-300 font-semibold">+{s.b - s.a} баллов</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Motivation Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-futuristic">Мотивация и достижения</h2>
            <p className="text-xl text-gray-400">Геймификация обучения для лучших результатов</p>
          </div>
          
          <div className="grid grid-cols-12 gap-8">
            <article className="col-span-12 md:col-span-6">
              <div className="futuristic-card p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 p-0.5">
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Aibaixes</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Еженедельные челленджи, рейтинги и награды за прогресс. 
                  Соревнуйтесь с друзьями и достигайте новых высот!
                </p>
              </div>
            </article>
            
            <article className="col-span-12 md:col-span-6">
              <div className="futuristic-card p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Ранги</h3>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  Повышайте ранг, выполняя цели и достигая новых уровней мастерства.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Текущий ранг</span>
                    <span>65%</span>
                  </div>
                  <div className="progress-futuristic h-3 rounded-full">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: '65%' }} />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Reviews and Trainers */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-futuristic">Тренеры и отзывы</h2>
            <p className="text-xl text-gray-400">Наши эксперты и мнения студентов</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {['Асель К.', 'Ерлан Т.', 'Алина Ж.', 'Дидар С.', 'Айгерим Н.', 'Тимур Р.'].map((n, i) => (
              <div key={i} className="text-center group">
                <div className="futuristic-card aspect-square rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-all duration-500">
                  <div className="size-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-0.5 mb-4">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {n[0]}
                    </div>
                  </div>
                  <div className="font-bold text-white text-lg">{n}</div>
                  <div className="text-sm text-gray-400">Предмет</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Очень понравилась аналитика и разбор ошибок! — Дана",
              "Чат‑бот реально помогает понять тему. — Нурбол", 
              "Удобные тесты и понятная динамика. — Алия"
            ].map((q, i) => (
              <blockquote key={i} className="futuristic-card p-6 text-lg italic">
                <Sparkles className="h-6 w-6 text-yellow-400 mb-3" />
                "{q}"
              </blockquote>
            ))}
          </div>
          
          <div className="text-center">
            <a 
              href="https://instagram.com/" 
              className="btn-futuristic text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Смотреть в Instagram
            </a>
          </div>
        </section>

        {/* Subscription Formats */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-futuristic">Тарифы</h2>
            <p className="text-xl text-gray-400">Выберите подходящий план для ваших целей</p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {[
              {
                name: 'Базовый', 
                price: '15,000 ₸', 
                features: ['Доступ к тестам', 'ИИ Чат‑бот ассистент', 'Базовая аналитика'],
                gradient: 'from-blue-500 to-cyan-500'
              }, 
              {
                name: 'Премиум', 
                price: '25,000 ₸', 
                features: ['Все из Базового', 'Расширенная аналитика', 'Приоритетная поддержка', 'Персональный план'],
                gradient: 'from-purple-500 to-pink-500',
                popular: true
              }
            ].map((p, i) => (
              <div key={i} className="relative group">
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                      ПОПУЛЯРНЫЙ
                    </span>
                  </div>
                )}
                <div className={`futuristic-card p-8 h-full hover:scale-105 transition-all duration-500 ${p.popular ? 'ring-2 ring-yellow-500/50' : ''}`}>
                  <div className="text-center mb-8">
                    <div className="text-sm text-gray-400 mb-2">Подписка на месяц</div>
                    <div className="text-4xl font-black text-futuristic mb-2">{p.price}</div>
                    <div className="text-2xl font-bold text-white">{p.name}</div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-gray-300">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.gradient}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full btn-futuristic text-lg py-4">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Оформить
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Contact Form */}
          <div className="futuristic-card p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Оставить заявку</h3>
              <p className="text-gray-400">Свяжитесь с нами для получения консультации</p>
            </div>
            
            <form className="grid grid-cols-12 gap-6">
              <input 
                className="col-span-12 md:col-span-4 input-futuristic" 
                type="text" 
                name="name" 
                placeholder="Имя" 
                aria-label="Имя" 
                required 
              />
              <input 
                className="col-span-12 md:col-span-4 input-futuristic" 
                type="tel" 
                name="phone" 
                placeholder="Телефон" 
                aria-label="Телефон" 
                required 
              />
              <input 
                className="col-span-12 md:col-span-4 input-futuristic" 
                type="text" 
                name="city" 
                placeholder="Город" 
                aria-label="Город" 
              />
              <label className="col-span-12 flex items-start gap-3 text-sm text-gray-400">
                <input type="checkbox" required aria-label="Согласие на обработку данных" className="mt-1" />
                <span>Соглашаюсь с условиями и обработкой персональных данных</span>
              </label>
              <button 
                type="submit" 
                className="col-span-12 md:col-span-4 btn-futuristic text-lg py-4"
              >
                <Zap className="h-5 w-5 mr-2" />
                Отправить заявку
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};