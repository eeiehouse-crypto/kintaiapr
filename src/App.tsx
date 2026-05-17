import { useState, useEffect } from 'react';
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [screen, setScreen] = useState<'clock_in' | 'admin'>('clock_in');

  // アプリ起動時のデータ読み込みと自動デモデータ初期シード
  useEffect(() => {
    const savedEmployees = getEmployees();
    const savedLogs = getAttendanceLogs();

    if (savedEmployees.length === 0) {
      // データベースが完全に空の場合、初期体験を最高にするためにデモデータを自動シードする
      saveEmployees(DEMO_EMPLOYEES);
      const demoLogs = generateDemoAttendanceLogs();
      saveAttendanceLogs(demoLogs);

      setEmployees(DEMO_EMPLOYEES);
      setAttendanceLogs(demoLogs);
      console.log('Seeded demo data on first load.');
    } else {
      setEmployees(savedEmployees);
      setAttendanceLogs(savedLogs);
    }
  }, []);

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
