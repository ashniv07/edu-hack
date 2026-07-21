import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * EducatorDashboard - Analytics and Progress Tracking
 *
 * Features:
 * - Student progress overview
 * - Common error patterns
 * - Concept mastery tracking
 * - Time spent analytics
 * - Recommendation engine
 */

interface StudentProgress {
  id: string;
  name: string;
  totalErrors: number;
  resolvedErrors: number;
  conceptMastery: Record<string, number>;
  commonErrors: string[];
  averageTimeToResolve: number;
  lastActive: Date;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface ClassAnalytics {
  totalStudents: number;
  averageMastery: number;
  commonStruggles: { concept: string; count: number }[];
  topPerformers: StudentProgress[];
  needsHelp: StudentProgress[];
  dailyActivity: { date: string; sessions: number }[];
}

interface EducatorDashboardProps {
  studentData?: StudentProgress[];
  classAnalytics?: ClassAnalytics;
  isDemo?: boolean;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = ({
  studentData,
  classAnalytics,
  isDemo = true,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'concepts' | 'recommendations'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  // Use demo data if no real data provided
  const data = useMemo(() => {
    if (isDemo) {
      return generateDemoData();
    }
    return { students: studentData || [], analytics: classAnalytics };
  }, [studentData, classAnalytics, isDemo]);

  const renderOverview = () => (
    <div style={styles.overviewGrid}>
      {/* Quick Stats */}
      <motion.div
        style={styles.statCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <span style={styles.statIcon}>👥</span>
        <span style={styles.statValue}>{data.analytics?.totalStudents || 0}</span>
        <span style={styles.statLabel}>Total Students</span>
      </motion.div>

      <motion.div
        style={styles.statCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span style={styles.statIcon}>📊</span>
        <span style={styles.statValue}>{data.analytics?.averageMastery || 0}%</span>
        <span style={styles.statLabel}>Avg. Mastery</span>
      </motion.div>

      <motion.div
        style={styles.statCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span style={styles.statIcon}>🎯</span>
        <span style={styles.statValue}>{data.analytics?.topPerformers.length || 0}</span>
        <span style={styles.statLabel}>Excelling</span>
      </motion.div>

      <motion.div
        style={styles.statCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span style={styles.statIcon}>🆘</span>
        <span style={styles.statValue}>{data.analytics?.needsHelp.length || 0}</span>
        <span style={styles.statLabel}>Need Help</span>
      </motion.div>

      {/* Common Struggles Chart */}
      <motion.div
        style={styles.chartCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 style={styles.chartTitle}>Common Struggles</h4>
        <div style={styles.barChart}>
          {data.analytics?.commonStruggles.slice(0, 5).map((struggle, index) => (
            <div key={struggle.concept} style={styles.barRow}>
              <span style={styles.barLabel}>{struggle.concept}</span>
              <div style={styles.barContainer}>
                <motion.div
                  style={{
                    ...styles.bar,
                    background: getBarColor(index),
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(struggle.count / 30) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                />
              </div>
              <span style={styles.barValue}>{struggle.count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        style={styles.chartCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h4 style={styles.chartTitle}>Weekly Activity</h4>
        <div style={styles.activityChart}>
          {data.analytics?.dailyActivity.map((day, index) => (
            <div key={day.date} style={styles.activityBar}>
              <motion.div
                style={{
                  ...styles.activityFill,
                  background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.sessions / 50) * 100}%` }}
                transition={{ delay: 0.7 + index * 0.05 }}
              />
              <span style={styles.activityLabel}>{day.date}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderStudents = () => (
    <div style={styles.studentsContainer}>
      <div style={styles.studentsList}>
        <h4 style={styles.sectionTitle}>Students</h4>
        {data.students.map(student => (
          <motion.div
            key={student.id}
            style={{
              ...styles.studentCard,
              ...(selectedStudent?.id === student.id ? styles.selectedStudentCard : {}),
            }}
            onClick={() => setSelectedStudent(student)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={styles.studentInfo}>
              <span style={styles.studentAvatar}>
                {getSkillEmoji(student.skillLevel)}
              </span>
              <div>
                <span style={styles.studentName}>{student.name}</span>
                <span style={styles.studentLevel}>{student.skillLevel}</span>
              </div>
            </div>
            <div style={styles.studentMastery}>
              <div style={styles.masteryBar}>
                <div
                  style={{
                    ...styles.masteryFill,
                    width: `${Object.values(student.conceptMastery).reduce((a, b) => a + b, 0) /
                      Object.keys(student.conceptMastery).length}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            style={styles.studentDetail}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div style={styles.detailHeader}>
              <span style={styles.detailAvatar}>{getSkillEmoji(selectedStudent.skillLevel)}</span>
              <div>
                <h3 style={styles.detailName}>{selectedStudent.name}</h3>
                <span style={styles.detailLevel}>
                  {selectedStudent.skillLevel} level
                </span>
              </div>
            </div>

            <div style={styles.detailStats}>
              <div style={styles.detailStat}>
                <span style={styles.detailStatValue}>{selectedStudent.totalErrors}</span>
                <span style={styles.detailStatLabel}>Total Errors</span>
              </div>
              <div style={styles.detailStat}>
                <span style={styles.detailStatValue}>{selectedStudent.resolvedErrors}</span>
                <span style={styles.detailStatLabel}>Resolved</span>
              </div>
              <div style={styles.detailStat}>
                <span style={styles.detailStatValue}>
                  {Math.round((selectedStudent.resolvedErrors / selectedStudent.totalErrors) * 100)}%
                </span>
                <span style={styles.detailStatLabel}>Success Rate</span>
              </div>
            </div>

            <h4 style={styles.conceptsTitle}>Concept Mastery</h4>
            <div style={styles.conceptsList}>
              {Object.entries(selectedStudent.conceptMastery).map(([concept, mastery]) => (
                <div key={concept} style={styles.conceptRow}>
                  <span style={styles.conceptName}>{concept}</span>
                  <div style={styles.conceptBar}>
                    <div
                      style={{
                        ...styles.conceptFill,
                        width: `${mastery}%`,
                        background: mastery > 70 ? '#10b981' : mastery > 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span style={styles.conceptValue}>{mastery}%</span>
                </div>
              ))}
            </div>

            <h4 style={styles.conceptsTitle}>Common Errors</h4>
            <div style={styles.errorsList}>
              {selectedStudent.commonErrors.map((error, index) => (
                <span key={index} style={styles.errorTag}>
                  {error}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderConcepts = () => (
    <div style={styles.conceptsContainer}>
      <h4 style={styles.sectionTitle}>Concept Performance Overview</h4>
      <div style={styles.conceptGrid}>
        {getConceptOverview(data.students).map(concept => (
          <motion.div
            key={concept.name}
            style={styles.conceptCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div style={styles.conceptHeader}>
              <span style={styles.conceptIcon}>{concept.icon}</span>
              <span style={styles.conceptCardName}>{concept.name}</span>
            </div>
            <div style={styles.conceptMeter}>
              <svg viewBox="0 0 100 50" style={{ width: '100%', height: '60px' }}>
                <path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.3)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke={getMasteryColor(concept.avgMastery)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: concept.avgMastery / 100 }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <span style={styles.conceptMeterValue}>{concept.avgMastery}%</span>
            </div>
            <div style={styles.conceptStats}>
              <span>{concept.studentsStruggling} struggling</span>
              <span>{concept.studentsExcelling} excelling</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div style={styles.recommendationsContainer}>
      <h4 style={styles.sectionTitle}>AI-Powered Recommendations</h4>
      <div style={styles.recommendationsList}>
        {getRecommendations(data).map((rec, index) => (
          <motion.div
            key={index}
            style={{
              ...styles.recommendationCard,
              borderLeftColor: rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div style={styles.recHeader}>
              <span style={styles.recIcon}>{rec.icon}</span>
              <span style={styles.recPriority}>{rec.priority}</span>
            </div>
            <h5 style={styles.recTitle}>{rec.title}</h5>
            <p style={styles.recDescription}>{rec.description}</p>
            <div style={styles.recActions}>
              {rec.actions.map((action, i) => (
                <button key={i} style={styles.recAction}>
                  {action}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Educator Dashboard</h2>
        <div style={styles.tabs}>
          {(['overview', 'students', 'concepts', 'recommendations'] as const).map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'concepts' && renderConcepts()}
        {activeTab === 'recommendations' && renderRecommendations()}
      </div>

      {isDemo && (
        <div style={styles.demoNote}>
          Demo data - Connect to your classroom to see real analytics
        </div>
      )}
    </div>
  );
};

// Helper functions
function generateDemoData() {
  const students: StudentProgress[] = [
    {
      id: '1',
      name: 'Alice Chen',
      totalErrors: 24,
      resolvedErrors: 22,
      conceptMastery: { 'Array Indexing': 85, 'Dictionary Access': 70, 'Recursion': 45, 'Type Handling': 90 },
      commonErrors: ['IndexError', 'TypeError'],
      averageTimeToResolve: 180,
      lastActive: new Date(),
      skillLevel: 'advanced',
    },
    {
      id: '2',
      name: 'Bob Smith',
      totalErrors: 35,
      resolvedErrors: 20,
      conceptMastery: { 'Array Indexing': 55, 'Dictionary Access': 40, 'Recursion': 30, 'Type Handling': 60 },
      commonErrors: ['KeyError', 'RecursionError', 'IndexError'],
      averageTimeToResolve: 420,
      lastActive: new Date(),
      skillLevel: 'beginner',
    },
    {
      id: '3',
      name: 'Charlie Davis',
      totalErrors: 18,
      resolvedErrors: 16,
      conceptMastery: { 'Array Indexing': 75, 'Dictionary Access': 80, 'Recursion': 65, 'Type Handling': 70 },
      commonErrors: ['TypeError'],
      averageTimeToResolve: 240,
      lastActive: new Date(),
      skillLevel: 'intermediate',
    },
    {
      id: '4',
      name: 'Diana Lee',
      totalErrors: 12,
      resolvedErrors: 12,
      conceptMastery: { 'Array Indexing': 95, 'Dictionary Access': 90, 'Recursion': 85, 'Type Handling': 95 },
      commonErrors: [],
      averageTimeToResolve: 120,
      lastActive: new Date(),
      skillLevel: 'advanced',
    },
  ];

  const analytics: ClassAnalytics = {
    totalStudents: students.length,
    averageMastery: 72,
    commonStruggles: [
      { concept: 'Recursion', count: 28 },
      { concept: 'Dictionary Access', count: 22 },
      { concept: 'Array Indexing', count: 18 },
      { concept: 'Type Handling', count: 12 },
      { concept: 'None Handling', count: 8 },
    ],
    topPerformers: students.filter(s => s.skillLevel === 'advanced'),
    needsHelp: students.filter(s => s.skillLevel === 'beginner'),
    dailyActivity: [
      { date: 'Mon', sessions: 35 },
      { date: 'Tue', sessions: 42 },
      { date: 'Wed', sessions: 38 },
      { date: 'Thu', sessions: 45 },
      { date: 'Fri', sessions: 32 },
      { date: 'Sat', sessions: 15 },
      { date: 'Sun', sessions: 12 },
    ],
  };

  return { students, analytics };
}

function getSkillEmoji(level: string): string {
  switch (level) {
    case 'beginner': return '🌱';
    case 'intermediate': return '🌿';
    case 'advanced': return '🌳';
    default: return '📚';
  }
}

function getBarColor(index: number): string {
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
  return colors[index] || colors[4];
}

function getMasteryColor(mastery: number): string {
  if (mastery >= 70) return '#10b981';
  if (mastery >= 40) return '#f59e0b';
  return '#ef4444';
}

function getConceptOverview(students: StudentProgress[]) {
  return [
    { name: 'Array Indexing', icon: '📊', avgMastery: 77, studentsStruggling: 1, studentsExcelling: 2 },
    { name: 'Dictionary Access', icon: '🔑', avgMastery: 70, studentsStruggling: 1, studentsExcelling: 2 },
    { name: 'Recursion', icon: '🔄', avgMastery: 56, studentsStruggling: 2, studentsExcelling: 1 },
    { name: 'Type Handling', icon: '🏷️', avgMastery: 79, studentsStruggling: 0, studentsExcelling: 2 },
    { name: 'None Handling', icon: '❓', avgMastery: 65, studentsStruggling: 1, studentsExcelling: 1 },
    { name: 'Error Handling', icon: '⚠️', avgMastery: 72, studentsStruggling: 1, studentsExcelling: 2 },
  ];
}

function getRecommendations(data: any) {
  return [
    {
      icon: '🎯',
      priority: 'high' as const,
      title: 'Focus on Recursion',
      description: '50% of students are struggling with recursive functions. Consider reviewing base cases and stack visualization.',
      actions: ['Create Practice Assignment', 'Schedule Review Session'],
    },
    {
      icon: '👥',
      priority: 'medium' as const,
      title: 'Pair Programming Session',
      description: 'Bob Smith could benefit from working with Alice Chen on dictionary concepts.',
      actions: ['Suggest Pairing', 'View Student Details'],
    },
    {
      icon: '📈',
      priority: 'low' as const,
      title: 'Advanced Challenges Available',
      description: 'Diana Lee and Alice Chen are ready for more challenging material on data structures.',
      actions: ['Assign Advanced Problems'],
    },
  ];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    color: '#e2e8f0',
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: 600,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tab: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#94a3b8',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    borderColor: 'transparent',
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  statCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  statIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#e2e8f0',
    display: 'block',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
  },
  chartCard: {
    gridColumn: 'span 2',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  chartTitle: {
    color: '#e2e8f0',
    margin: '0 0 16px 0',
    fontSize: '14px',
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  barLabel: {
    width: '100px',
    fontSize: '12px',
    color: '#94a3b8',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  barContainer: {
    flex: 1,
    height: '8px',
    background: 'rgba(100, 116, 139, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '4px',
  },
  barValue: {
    width: '30px',
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'right',
  },
  activityChart: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100px',
    gap: '8px',
  },
  activityBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
  },
  activityFill: {
    width: '100%',
    borderRadius: '4px 4px 0 0',
  },
  activityLabel: {
    fontSize: '10px',
    color: '#64748b',
    marginTop: '4px',
  },
  studentsContainer: {
    display: 'flex',
    gap: '16px',
    height: '100%',
  },
  studentsList: {
    flex: 1,
    minWidth: '200px',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: '14px',
    margin: '0 0 12px 0',
  },
  studentCard: {
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  selectedStudentCard: {
    borderColor: '#6366f1',
    background: 'rgba(99, 102, 241, 0.1)',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  studentAvatar: {
    fontSize: '20px',
  },
  studentName: {
    color: '#e2e8f0',
    fontSize: '13px',
    display: 'block',
  },
  studentLevel: {
    color: '#64748b',
    fontSize: '11px',
    textTransform: 'capitalize',
  },
  studentMastery: {},
  masteryBar: {
    height: '4px',
    background: 'rgba(100, 116, 139, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
    borderRadius: '2px',
  },
  studentDetail: {
    flex: 2,
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  detailAvatar: {
    fontSize: '40px',
  },
  detailName: {
    color: '#e2e8f0',
    margin: 0,
    fontSize: '18px',
  },
  detailLevel: {
    color: '#6366f1',
    fontSize: '13px',
    textTransform: 'capitalize',
  },
  detailStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
  },
  detailStat: {
    textAlign: 'center',
  },
  detailStatValue: {
    display: 'block',
    color: '#e2e8f0',
    fontSize: '24px',
    fontWeight: 700,
  },
  detailStatLabel: {
    color: '#64748b',
    fontSize: '11px',
  },
  conceptsTitle: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    margin: '16px 0 8px 0',
  },
  conceptsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  conceptRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  conceptName: {
    width: '120px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  conceptBar: {
    flex: 1,
    height: '6px',
    background: 'rgba(100, 116, 139, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  conceptFill: {
    height: '100%',
    borderRadius: '3px',
  },
  conceptValue: {
    width: '40px',
    fontSize: '12px',
    color: '#64748b',
    textAlign: 'right',
  },
  errorsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  errorTag: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
  },
  conceptsContainer: {
    padding: '8px 0',
  },
  conceptGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },
  conceptCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    textAlign: 'center',
  },
  conceptHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  conceptIcon: {
    fontSize: '20px',
  },
  conceptCardName: {
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: 500,
  },
  conceptMeter: {
    position: 'relative',
    marginBottom: '8px',
  },
  conceptMeterValue: {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#e2e8f0',
    fontSize: '18px',
    fontWeight: 700,
  },
  conceptStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#64748b',
  },
  recommendationsContainer: {
    padding: '8px 0',
  },
  recommendationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recommendationCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  recIcon: {
    fontSize: '20px',
  },
  recPriority: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748b',
    background: 'rgba(100, 116, 139, 0.2)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  recTitle: {
    color: '#e2e8f0',
    margin: '0 0 8px 0',
    fontSize: '14px',
  },
  recDescription: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.5,
    margin: '0 0 12px 0',
  },
  recActions: {
    display: 'flex',
    gap: '8px',
  },
  recAction: {
    background: 'rgba(99, 102, 241, 0.2)',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#a5b4fc',
    fontSize: '12px',
    cursor: 'pointer',
  },
  demoNote: {
    marginTop: '16px',
    padding: '10px',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    color: '#fbbf24',
    fontSize: '12px',
    textAlign: 'center',
  },
};

export default EducatorDashboard;
