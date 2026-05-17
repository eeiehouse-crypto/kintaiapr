export interface CustomAllowance {
  name: string;
  amount: number;
}

export interface Employee {
  id: string;
  name: string;
  kana: string; // 検索・五十音順ソート用（ひらがな）
  type: 'regular' | 'part'; // 正社員 | パート・アルバイト
  hourlyWage: number; // 基本給（正社員は月給、パートは時給）
  transitAllowance: number; // 交通費 (月額)
  allowance: number; // 手当 (月額)
  customAllowances?: CustomAllowance[]; // 自由入力手当（最大3つ）
  paidLeaveMinyashiHours: number; // 有給取得時の1日あたりみなし労働時間
  annualPaidLeaveDays: number; // 有給休暇の年間付与日数
  joinDate: string; // 入社日 (YYYY-MM-DD)
  isActive: boolean; // 有効かどうか
}

export type AttendanceStatus = 'clocked_out' | 'clocked_in' | 'on_break';

export interface AttendanceLog {
  id: string;
  employeeId: string;
  date: string; // 日付 (YYYY-MM-DD)
  clockIn: string | null; // 出勤時刻 (HH:MM) または ISO文字列
  clockOut: string | null; // 退勤時刻 (HH:MM)
  breakStart: string | null; // 休憩開始時刻 (HH:MM)
  breakEnd: string | null; // 休憩終了時刻 (HH:MM)
  manualBreakMinutes: number | null; // 手動で入力した休憩時間（分）。nullの場合は自動休憩控除または打刻時間から算出
  isPaidLeave: boolean; // 有給休暇かどうか
  paidLeaveType: 'full' | 'half' | null; // 全休 | 半休
  notes: string; // 管理者メモ・備考
}

export interface DayPayroll {
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  isPaidLeave: boolean;
  paidLeaveType: 'full' | 'half' | null;
  workMinutes: number; // 通常勤務時間（分）
  breakMinutes: number; // 休憩時間（分）
  overtimeMinutes: number; // 週40時間超の残業時間（分）
  transitAllowance: number; // 支給交通費
  basePay: number; // 基本給（通常労働分）
  overtimePay: number; // 残業手当（1.25倍）
  paidLeavePay: number; // 有給手当
  dayTotalPay: number; // 日合計支給額
}

export interface WeeklyCalculation {
  weekStart: string; // 週の開始日（月曜日, YYYY-MM-DD）
  weekEnd: string; // 週の終了日（日曜日, YYYY-MM-DD）
  totalWorkMinutes: number; // その週の総実労働時間（有給分は含まない）
  overtimeMinutes: number; // その週に発生した40時間超えの残業時間（分）
}

export interface EmployeeMonthlyPayroll {
  employeeId: string;
  employeeName: string;
  employeeType: 'regular' | 'part';
  hourlyWage: number;
  totalDaysWorked: number; // 出勤日数
  totalPaidLeaveDaysUsed: number; // 有給取得日数
  totalWorkHours: number; // 総実労働時間（時間）
  totalOvertimeHours: number; // 残業時間（時間）
  totalBreakHours: number; // 休憩時間（時間）
  basePay: number; // 通常基本給
  overtimePay: number; // 割増残業代（1.25倍）
  paidLeavePay: number; // 有給支給額
  transitAllowance: number; // 交通費合計
  allowance: number; // 各種手当
  customAllowances?: CustomAllowance[]; // 各種手当のカスタム内訳
  totalPay: number; // 総支給額（総額）
  dailyDetails: DayPayroll[]; // 日ごとの詳細データ
}

export interface SystemData {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
}
