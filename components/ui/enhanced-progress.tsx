import React from 'react';
import { Target, BookOpen, TrendingUp, Clock } from 'lucide-react';

interface ProgressWithContextProps {
  subject: string;
  current: number;
  target: number;
  percentage: number;
  unit?: 'вопросов' | 'тестов' | 'часов' | 'заданий';
  timeSpent?: number;
  lastActivity?: string;
  showDetails?: boolean;
  className?: string;
}

export const ProgressWithContext: React.FC<ProgressWithContextProps> = ({
  subject,
  current,
  target,
  percentage,
  unit = 'вопросов',
  timeSpent,
  lastActivity,
  showDetails = true,
  className = ''
}) => {
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'progress-excellent';
    if (percent >= 70) return 'progress-good';
    if (percent >= 50) return 'progress-average';
    return 'progress-poor';
  };

  const getStatusText = (percent: number) => {
    if (percent >= 90) return 'Отлично';
    if (percent >= 70) return 'Хорошо';
    if (percent >= 50) return 'Средне';
    return 'Требует внимания';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  return (
    <div className={`progress-with-context ${className}`}>
      {/* Progress Header */}
      <div className="progress-header">
        <div className="progress-subject">
          <BookOpen className="w-4 h-4" />
          <span>{subject}</span>
        </div>
        <div className="progress-value">
          <span>{percentage}%</span>
          <span className="text-xs">({getStatusText(percentage)})</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-enhanced">
        <div 
          className={`progress-bar-enhanced ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${subject}: ${percentage}% завершено`}
        />
      </div>

      {/* Progress Details */}
      {showDetails && (
        <div className="progress-details">
          <div className="progress-questions">
            <Target className="w-3 h-3" />
            <span>{current} из {target} {unit}</span>
          </div>
          <div className="progress-target">
            {timeSpent && (
              <>
                <Clock className="w-3 h-3" />
                <span>{formatTime(timeSpent)}</span>
              </>
            )}
            {lastActivity && (
              <span className="text-xs">
                Последняя активность: {lastActivity}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Screen reader content */}
      <div className="progress-sr-only">
        {subject}: завершено {current} из {target} {unit} ({percentage}%). 
        {timeSpent && `Потрачено времени: ${formatTime(timeSpent)}.`}
      </div>
    </div>
  );
};

interface SubjectProgressCardProps {
  subject: string;
  description?: string;
  current: number;
  target: number;
  percentage: number;
  timeSpent?: number;
  questionsCorrect?: number;
  questionsTotal?: number;
  lastActivity?: string;
  onClick?: () => void;
  className?: string;
}

export const SubjectProgressCard: React.FC<SubjectProgressCardProps> = ({
  subject,
  description,
  current,
  target,
  percentage,
  timeSpent,
  questionsCorrect,
  questionsTotal,
  lastActivity,
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div 
      className={`card-interactive ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : "article"}
      aria-label={`${subject}: ${percentage}% завершено`}
    >
      {/* Subject Header */}
      <div className="content-with-subject">
        <div className="subject-label">{subject}</div>
        {description && (
          <div className="content-main">{description}</div>
        )}
      </div>

      {/* Progress Section */}
      <div className="mt-4">
        <ProgressWithContext
          subject=""
          current={current}
          target={target}
          percentage={percentage}
          timeSpent={timeSpent}
          lastActivity={lastActivity}
          showDetails={false}
        />
      </div>

      {/* Statistics */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-600">
        <div className="content-secondary">
          <TrendingUp className="w-3 h-3" />
          <span>Прогресс: {current}/{target}</span>
        </div>
        {questionsCorrect && questionsTotal && (
          <div className="content-secondary">
            <Target className="w-3 h-3" />
            <span>Точность: {Math.round((questionsCorrect / questionsTotal) * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced question count component
interface QuestionCountEnhancedProps {
  subject: string;
  current: number;
  target: number;
  difficulty?: 'легкий' | 'средний' | 'сложный';
  category?: string;
  dueDate?: string;
  className?: string;
}

export const QuestionCountEnhanced: React.FC<QuestionCountEnhancedProps> = ({
  subject,
  current,
  target,
  difficulty,
  category,
  dueDate,
  className = ''
}) => {
  const percentage = Math.round((current / target) * 100);
  
  return (
    <div className={`question-count-enhanced ${className}`}>
      <div className="question-count-subject">
        {subject}
        {category && (
          <span className="ml-2 text-xs text-gray-500">({category})</span>
        )}
      </div>
      
      <div className="question-count-stats">
        <div className="question-count-progress">
          <span className="font-medium">{current} из {target} вопросов</span>
          <span className="text-xs">({percentage}%)</span>
        </div>
        
        <div className="question-count-target">
          {difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              difficulty === 'легкий' ? 'bg-green-100 text-green-700' :
              difficulty === 'средний' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {difficulty}
            </span>
          )}
          {dueDate && (
            <span className="text-xs">до {dueDate}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressWithContext;
