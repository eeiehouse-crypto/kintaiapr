import { useState } from 'react';
import type { Employee, AttendanceLog } from './types';
import { 
  getEmployees, 
  saveEmployees, 
  getAttendanceLogs, 
  saveAttendanceLogs 
} from './utils/storage';
import { DEMO_EMPLOYEES, generateDemoAttendanceLogs } from './utils/demoData';
import { ClockInScreen } from './components/ClockInScreen';
import { AdminDashboard } from './components/AdminDashboard';
import './App.css';

function App() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = getEmployees();
    if (saved.length === 0) {
      saveEmployees(DEMO_EMPLOYEES);
      return DEMO_EMPLOYEES;
    }
    return saved;
  });
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    const saved = getAttendanceLogs();
    if (saved.length === 0) {
      const demoLogs = generateDemoAttendanceLogs();
      saveAttendanceLogs(demoLogs);
      return demoLogs;
    }
    return saved;
  });
  const [screen, setScreen] = useState<'clock_in' | 'admin'>('clock_in');

  // 従業員データの更新と永続化
  const handleUpdateEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    saveEmployees(updatedEmployees);
  };

  // 打刻履歴データの更新と永続化
  const handleUpdateAttendanceLogs = (updatedLogs: AttendanceLog[]) => {
    setAttendanceLogs(updatedLogs);
    saveAttendanceLogs(updatedLogs);
  };

  // 新規打刻ログの追加
  const handleAddLog = (newLog: AttendanceLog) => {
    const updated = [...attendanceLogs, newLog];
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);
  };

  // 既存打刻ログの更新
  const handleUpdateLog = (updatedLog: AttendanceLog) => {
    const updated = attendanceLogs.map(log => 
      log.id === updatedLog.id ? updatedLog : log
    );
    setAttendanceLogs(updated);
    saveAttendanceLogs(updated);
  };

  return (
    <>
      {screen === 'clock_in' ? (
        <ClockInScreen
          employees={employees}
          attendanceLogs={attendanceLogs}
          onAddLog={handleAddLog}
          onUpdateLog={handleUpdateLog}
          onNavigateToAdmin={() => setScreen('admin')}
        />
      ) : (
        <AdminDashboard
          employees={employees}
          attendanceLogs={attendanceLogs}
          onSetEmployees={handleUpdateEmployees}
          onSetAttendanceLogs={handleUpdateAttendanceLogs}
          onNavigateToClockIn={() => setScreen('clock_in')}
        />
      )}
    </>
  );
}

export default App;
