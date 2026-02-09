import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { habitsAPI } from '../services/api';

const CalendarView = ({ habits }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const data = await habitsAPI.getCalendar();
      
      // Transformar em objeto para fácil acesso
      const calendarMap = {};
      data.calendar.forEach(habit => {
        habit.completedDates.forEach(date => {
          const dateStr = new Date(date).toISOString().split('T')[0];
          if (!calendarMap[dateStr]) {
            calendarMap[dateStr] = [];
          }
          calendarMap[dateStr].push(habit);
        });
      });
      
      setCalendarData(calendarMap);
    } catch (error) {
      console.error('Erro ao carregar calendário:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getCompletionsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return calendarData[dateStr] || [];
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const monthYear = currentDate.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">{monthYear}</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="p-2 glass-hover rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="p-2 glass-hover rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-sm font-semibold text-dark-400 py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const completions = getCompletionsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <motion.div
              key={index}
              whileHover={date ? { scale: 1.05 } : {}}
              onClick={() => date && setSelectedDate(date)}
              className={`
                aspect-square p-2 rounded-xl cursor-pointer transition-all
                ${!date ? 'invisible' : ''}
                ${isToday ? 'ring-2 ring-primary-500' : ''}
                ${completions.length > 0 ? 'glass-hover' : 'bg-dark-800/30'}
              `}
            >
              {date && (
                <>
                  <div className="text-sm font-semibold mb-1">
                    {date.getDate()}
                  </div>
                  
                  {/* Habit icons */}
                  {completions.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {completions.slice(0, 4).map((habit, i) => (
                        <div
                          key={i}
                          className="text-xs"
                          title={habit.title}
                        >
                          {habit.icon}
                        </div>
                      ))}
                      {completions.length > 4 && (
                        <div className="text-xs text-dark-400">
                          +{completions.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass-hover rounded-2xl p-4"
        >
          <h3 className="font-bold mb-3">
            {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>
          
          {getCompletionsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getCompletionsForDate(selectedDate).map((habit) => (
                <div 
                  key={habit.id} 
                  className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: habit.color + '30' }}
                  >
                    {habit.icon}
                  </div>
                  <span className="font-medium">{habit.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm">
              Nenhum hábito completado neste dia
            </p>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-sm text-dark-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-dark-800/30" />
          <span>Sem atividade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded glass" />
          <span>Com atividade</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary-500" />
          <span>Hoje</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarView;
