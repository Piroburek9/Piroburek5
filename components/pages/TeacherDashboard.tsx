import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, BookOpen, Plus, Settings, Download, MessageSquare, Target, Award, Clock, BarChart3, PieChart, LineChart } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
	const [currentLanguage, setCurrentLanguage] = useState<'ru' | 'kk'>('ru');
	const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'analytics' | 'tests' | 'reports'>('overview');
	const [selectedClass, setSelectedClass] = useState<'11A' | '11B'>('11A');

	const translations = {
		ru: {
			dashboard: 'Дашборд учителя',
			overview: 'Обзор',
			students: 'Ученики',
			analytics: 'Аналитика',
			tests: 'Тесты',
			reports: 'Отчеты',
			myClasses: 'Мои классы',
			totalStudents: 'Всего учеников',
			activeTests: 'Активные тесты',
			avgScore: 'Средний балл',
			improvement: 'Улучшение',
			recentActivity: 'Последняя активность',
			topPerformers: 'Лучшие ученики',
			weakAreas: 'Слабые области',
			createTest: 'Создать тест',
			viewDetails: 'Подробнее',
			performance: 'Успеваемость',
			progress: 'Прогресс',
			recommendations: 'Рекомендации',
			export: 'Экспорт',
			studentName: 'Имя ученика',
			lastTest: 'Последний тест',
			score: 'Балл',
			trend: 'Тенденция',
			subjects: 'Предметы',
			mathematics: 'Математика',
			physics: 'Физика',
			chemistry: 'Химия',
			biology: 'Биология'
		},
		kk: {
			dashboard: 'Мұғалім дашборды',
			overview: 'Шолу',
			students: 'Оқушылар',
			analytics: 'Аналитика',
			tests: 'Тестілер',
			reports: 'Есептер',
			myClasses: 'Менің сыныптарым',
			totalStudents: 'Барлық оқушылар',
			activeTests: 'Белсенді тестілер',
			avgScore: 'Орташа балл',
			improvement: 'Жақсару',
			recentActivity: 'Соңғы белсенділік',
			topPerformers: 'Үздік оқушылар',
			weakAreas: 'Әлсіз салалар',
			createTest: 'Тест жасау',
			viewDetails: 'Толығырақ',
			performance: 'Үлгерім',
			progress: 'Прогресс',
			recommendations: 'Ұсыныстар',
			export: 'Экспорт',
			studentName: 'Оқушы аты',
			lastTest: 'Соңғы тест',
			score: 'Балл',
			trend: 'Үрдіс',
			subjects: 'Пәндер',
			mathematics: 'Математика',
			physics: 'Физика',
			chemistry: 'Химия',
			biology: 'Биология'
		}
	};

	const t = translations[currentLanguage];

	const classData = {
		'11A': {
			students: 28,
			avgScore: 75,
			improvement: '+8%',
			recentTests: [
				{ id: 1, name: t.mathematics, completed: 25, avg: 78 },
				{ id: 2, name: t.physics, completed: 23, avg: 72 },
				{ id: 3, name: t.chemistry, completed: 27, avg: 80 }
			]
		},
		'11B': {
			students: 26,
			avgScore: 71,
			improvement: '+5%',
			recentTests: [
				{ id: 1, name: t.mathematics, completed: 24, avg: 73 },
				{ id: 2, name: t.physics, completed: 22, avg: 69 },
				{ id: 3, name: t.biology, completed: 25, avg: 75 }
			]
		}
	} as const;

	const studentData = [
		{ id: 1, name: 'Айжан Сейтова', lastTest: t.mathematics, score: 92, trend: 'up', avatar: '👩' },
		{ id: 2, name: 'Данияр Нурланов', lastTest: t.physics, score: 88, trend: 'up', avatar: '👨' },
		{ id: 3, name: 'Камила Жанбекова', lastTest: t.chemistry, score: 85, trend: 'stable', avatar: '👩' },
		{ id: 4, name: 'Арман Досов', lastTest: t.mathematics, score: 82, trend: 'down', avatar: '👨' },
		{ id: 5, name: 'Диана Абдуллина', lastTest: t.biology, score: 79, trend: 'up', avatar: '👩' }
	];

	const weakAreas = [
		{ topic: currentLanguage === 'ru' ? 'Интегралы' : 'Интегралдар', percentage: 45, subject: t.mathematics },
		{ topic: currentLanguage === 'ru' ? 'Электродинамика' : 'Электродинамика', percentage: 52, subject: t.physics },
		{ topic: currentLanguage === 'ru' ? 'Органическая химия' : 'Органикалық химия', percentage: 58, subject: t.chemistry }
	];

	const renderOverviewTab = () => (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-blue-100 text-sm">{t.totalStudents}</p>
							<p className="text-3xl font-bold">{classData[selectedClass].students}</p>
						</div>
						<Users size={40} className="text-blue-200" />
					</div>
				</div>

				<div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-green-100 text-sm">{t.avgScore}</p>
							<p className="text-3xl font-bold">{classData[selectedClass].avgScore}%</p>
						</div>
						<Target size={40} className="text-green-200" />
					</div>
				</div>

				<div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-purple-100 text-sm">{t.activeTests}</p>
							<p className="text-3xl font-bold">5</p>
						</div>
						<BookOpen size={40} className="text-purple-200" />
					</div>
				</div>

				<div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-orange-100 text-sm">{t.improvement}</p>
							<p className="text-3xl font-bold">{classData[selectedClass].improvement}</p>
						</div>
						<TrendingUp size={40} className="text-orange-200" />
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-xl font-bold text-gray-800">{t.recentActivity}</h3>
						<button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
							<Download size={16} />
							{t.export}
						</button>
					</div>

					<div className="space-y-4">
						{classData[selectedClass].recentTests.map((test) => (
							<div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
										<BookOpen size={20} className="text-indigo-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-800">{test.name}</h4>
										<p className="text-sm text-gray-600">
											{test.completed} {currentLanguage === 'ru' ? 'из' : 'ден'} {classData[selectedClass].students} {currentLanguage === 'ru' ? 'выполнили' : 'орындады'}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold text-gray-800">{test.avg}%</p>
									<p className="text-sm text-gray-600">{currentLanguage === 'ru' ? 'средний балл' : 'орташа балл'}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-6">{t.topPerformers}</h3>
					<div className="space-y-4">
						{studentData.slice(0, 5).map((student, index) => (
							<div key={student.id} className="flex items-center gap-3">
								<div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-bold">
									{index + 1}
								</div>
								<div className="text-2xl">{student.avatar}</div>
								<div className="flex-1">
									<p className="font-semibold text-gray-800">{student.name}</p>
									<p className="text-sm text-gray-600">{student.score}%</p>
								</div>
								<div className={`w-6 h-6 rounded-full ${
									student.trend === 'up' ? 'bg-green-100' : 
									student.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
								}`}> 
									<TrendingUp size={16} className={`m-1 ${
										student.trend === 'up' ? 'text-green-600' : 
										student.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
									}`} />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-lg p-6">
				<h3 className="text-xl font-bold text-gray-800 mb-6">{t.weakAreas}</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{weakAreas.map((area, index) => (
						<div key={index} className="p-4 border border-gray-200 rounded-xl">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold text-gray-800">{area.topic}</h4>
								<span className="text-sm text-gray-600">{area.subject}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3 mb-2">
								<div className="bg-red-500 h-3 rounded-full" style={{ width: `${area.percentage}%` }}></div>
							</div>
							<p className="text-sm text-gray-600">{area.percentage}% {currentLanguage === 'ru' ? 'понимания' : 'түсіну'}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);

	const renderStudentsTab = () => (
		<div className="bg-white rounded-2xl shadow-lg p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-xl font-bold text-gray-800">{t.students} - {selectedClass}</h3>
				<div className="flex gap-3">
					<button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
						<MessageSquare size={16} />
						{currentLanguage === 'ru' ? 'Отправить сообщение' : 'Хабарлама жіберу'}
					</button>
					<button className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
						<Download size={16} />
						{t.export}
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="text-left py-3 px-4 font-semibold text-gray-700">{t.studentName}</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">{t.lastTest}</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">{t.score}</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">{t.trend}</th>
							<th className="text-left py-3 px-4 font-semibold text-gray-700">{currentLanguage === 'ru' ? 'Действия' : 'Әрекеттер'}</th>
						</tr>
					</thead>
					<tbody>
						{studentData.map((student) => (
							<tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
								<td className="py-4 px-4">
									<div className="flex items-center gap-3">
										<div className="text-2xl">{student.avatar}</div>
										<span className="font-medium text-gray-800">{student.name}</span>
									</div>
								</td>
								<td className="py-4 px-4 text-gray-600">{student.lastTest}</td>
								<td className="py-4 px-4">
									<span className={`px-3 py-1 rounded-full text-sm font-medium ${
										student.score >= 85 ? 'bg-green-100 text-green-700' :
										student.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
										'bg-red-100 text-red-700'
									}`}>{student.score}%</span>
								</td>
								<td className="py-4 px-4">
									<div className={`w-8 h-8 rounded-full flex items-center justify-center ${
										student.trend === 'up' ? 'bg-green-100' : 
										student.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
									}`}> 
										<TrendingUp size={16} className={`${
											student.trend === 'up' ? 'text-green-600' : 
											student.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
										}`} />
									</div>
								</td>
								<td className="py-4 px-4">
									<button className="text-indigo-600 hover:text-indigo-800 font-medium">{t.viewDetails}</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);

	const renderAnalyticsTab = () => (
		<div className="space-y-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4">{t.performance} {currentLanguage === 'ru' ? 'по месяцам' : 'айлар бойынша'}</h3>
					<div className="h-64 flex items-end justify-between gap-2">
						{[65, 70, 75, 78, 82, 75].map((value, index) => (
							<div key={index} className="flex flex-col items-center gap-2">
								<div className="bg-indigo-500 rounded-t-lg w-8 transition-all hover:bg-indigo-600" style={{ height: `${(value / 100) * 200}px` }}></div>
								<span className="text-xs text-gray-600">{['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'][index]}</span>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4">{currentLanguage === 'ru' ? 'Распределение по предметам' : 'Пәндер бойынша үлестіру'}</h3>
					<div className="space-y-4">
						{[
							{ subject: t.mathematics, percentage: 85, color: 'bg-blue-500' },
							{ subject: t.physics, percentage: 70, color: 'bg-green-500' },
							{ subject: t.chemistry, percentage: 78, color: 'bg-purple-500' },
							{ subject: t.biology, percentage: 82, color: 'bg-orange-500' }
						].map((item, index) => (
							<div key={index} className="space-y-2">
								<div className="flex justify-between">
									<span className="font-medium text-gray-700">{item.subject}</span>
									<span className="text-gray-600">{item.percentage}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-3">
									<div className={`${item.color} h-3 rounded-full transition-all`} style={{ width: `${item.percentage}%` }}></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-lg p-6">
				<h3 className="text-xl font-bold text-gray-800 mb-4">{currentLanguage === 'ru' ? 'AI Рекомендации для класса' : 'Сынып үшін AI ұсыныстары'}</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
						<h4 className="font-semibold text-blue-800 mb-2">{currentLanguage === 'ru' ? 'Сильные стороны' : 'Күшті жақтары'}</h4>
						<ul className="text-sm text-blue-700 space-y-1">
							<li>• {currentLanguage === 'ru' ? 'Хорошее понимание алгебры' : 'Алгебраны жақсы түсіну'}</li>
							<li>• {currentLanguage === 'ru' ? 'Стабильный прогресс в геометрии' : 'Геометрияда тұрақты прогресс'}</li>
							<li>• {currentLanguage === 'ru' ? 'Активное участие в тестах' : 'Тестілерге белсенді қатысу'}</li>
						</ul>
					</div>
					
					<div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-500">
						<h4 className="font-semibold text-orange-800 mb-2">{currentLanguage === 'ru' ? 'Области для улучшения' : 'Жақсарту салалары'}</h4>
						<ul className="text-sm text-orange-700 space-y-1">
							<li>• {currentLanguage === 'ru' ? 'Нужна дополнительная работа с интегралами' : 'Интегралдармен қосымша жұмыс керек'}</li>
							<li>• {currentLanguage === 'ru' ? 'Повысить точность в вычислениях' : 'Есептеулердегі дәлдікті арттыру'}</li>
							<li>• {currentLanguage === 'ru' ? 'Больше практики по физике' : 'Физика бойынша көбірек жаттығу'}</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-4">
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-800">{t.dashboard}</h1>
						<p className="text-gray-600 mt-1">{currentLanguage === 'ru' ? 'Добро пожаловать, Айгуль Серикова' : 'Қош келдіңіз, Айгүл Серікова'}</p>
					</div>
					
					<div className="flex items-center gap-4">
						<select 
							value={selectedClass}
							onChange={(e) => setSelectedClass(e.target.value as '11A' | '11B')}
							className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						>
							<option value="11A">Класс 11А</option>
							<option value="11B">Класс 11Б</option>
						</select>

						<button
							onClick={() => setCurrentLanguage(currentLanguage === 'ru' ? 'kk' : 'ru')}
							className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200"
						>
							{currentLanguage === 'ru' ? 'ҚAZ' : 'RUS'}
						</button>

						<button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
							<Plus size={20} />
							{t.createTest}
						</button>
					</div>
				</div>

				<div className="flex space-x-1 mb-8 bg-white rounded-2xl p-2 shadow-lg">
					{[
						{ id: 'overview', label: t.overview, icon: BarChart3 },
						{ id: 'students', label: t.students, icon: Users },
						{ id: 'analytics', label: t.analytics, icon: PieChart },
						{ id: 'tests', label: t.tests, icon: BookOpen },
						{ id: 'reports', label: t.reports, icon: LineChart }
					].map((tab) => (
						<button
							key={tab.id as string}
							onClick={() => setActiveTab(tab.id as typeof activeTab)}
							className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
								activeTab === tab.id
									? 'bg-indigo-600 text-white'
									: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
							}`}
						>
							<tab.icon size={20} />
							{tab.label}
						</button>
					))}
				</div>

				<div>
					{activeTab === 'overview' && renderOverviewTab()}
					{activeTab === 'students' && renderStudentsTab()}
					{activeTab === 'analytics' && renderAnalyticsTab()}
					{activeTab === 'tests' && (
						<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
							<BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-bold text-gray-800 mb-2">{currentLanguage === 'ru' ? 'Управление тестами' : 'Тестілерді басқару'}</h3>
							<p className="text-gray-600 mb-6">{currentLanguage === 'ru' ? 'Создавайте и управляйте тестами для ваших учеников' : 'Оқушыларыңыз үшін тестілер жасаңыз және басқарыңыз'}</p>
							<button className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
								<Plus size={20} />
								{t.createTest}
							</button>
						</div>
					)}
					{activeTab === 'reports' && (
						<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
							<Download size={64} className="mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-bold text-gray-800 mb-2">{currentLanguage === 'ru' ? 'Отчеты и аналитика' : 'Есептер мен аналитика'}</h3>
							<p className="text-gray-600 mb-6">{currentLanguage === 'ru' ? 'Генерируйте подробные отчеты о прогрессе учеников' : 'Оқушылардың прогресі туралы толық есептер жасаңыз'}</p>
							<div className="flex gap-4 justify-center">
								<button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
									{currentLanguage === 'ru' ? 'Экспорт в Excel' : 'Excel-ге экспорт'}
								</button>
								<button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700">
									{currentLanguage === 'ru' ? 'Создать PDF' : 'PDF жасау'}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TeacherDashboard;


