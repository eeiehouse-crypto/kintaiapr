import type { Employee, AttendanceLog, SystemData } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'kintai_employees',
  ATTENDANCE_LOGS: 'kintai_attendance_logs',
  ADMIN_PASSWORD: 'kintai_admin_password',
};

// 従業員データの取得
export const getEmployees = (): Employee[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse employees data:', error);
    return [];
  }
};

// 従業員データの保存
export const saveEmployees = (employees: Employee[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error('Failed to save employees data:', error);
  }
};

// 打刻履歴データの取得
export const getAttendanceLogs = (): AttendanceLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse attendance logs:', error);
    return [];
  }
};

// 打刻履歴データの保存
export const saveAttendanceLogs = (logs: AttendanceLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save attendance logs:', error);
  }
};

// 全システムデータの取得 (エクスポート用)
export const exportSystemData = (): SystemData => {
  return {
    employees: getEmployees(),
    attendanceLogs: getAttendanceLogs(),
  };
};

// システムデータのインポート (復元用)
export const importSystemData = (jsonData: string): boolean => {
  try {
    const parsed = JSON.parse(jsonData) as Partial<SystemData>;
    
    if (parsed && Array.isArray(parsed.employees) && Array.isArray(parsed.attendanceLogs)) {
      saveEmployees(parsed.employees);
      saveAttendanceLogs(parsed.attendanceLogs);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to import JSON data:', error);
    return false;
  }
};

// 管理者パスワードの取得 (デフォルト: 'admin')
export const getAdminPassword = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'admin';
};

// 管理者パスワードの保存
export const saveAdminPassword = (password: string): void => {
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, password);
};

// データのクリア
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_LOGS);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD);
};
