import type { Employee, AttendanceLog, DayPayroll, EmployeeMonthlyPayroll } from '../types';

// 時刻文字列 (HH:MM) を分に変換
export const timeStringToMinutes = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

// 分を時刻文字列 (HH:MM) に変換
export const minutesToTimeString = (minutes: number): string => {
  if (minutes <= 0) return '00:00';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(mins)}`;
};

// 分を表示用の時間 (例: 7.5時間 または 7時間30分) に変換
export const minutesToHoursDecimal = (minutes: number): number => {
  return Math.round((minutes / 60) * 100) / 100;
};

// 日付から曜日を取得する（日本語）
export const getDayOfWeekJP = (dateStr: string): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// 給与締め日の設定（現状は「末日締め」を想定。必要に応じて拡張可能）
// 該当月の日付一覧を取得する (YYYY-MM-DD)
export const getDaysInMonth = (year: number, month: number): string[] => {
  const days: string[] = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// 特定の日付が属する月曜日〜日曜日の一週間（YYYY-MM-DDの配列）を取得する
export const getWeekDates = (dateStr: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(dateStr);
  const day = currentDate.getDay();
  // 月曜日を週の開始とする (JavaScriptのgetDay()は 日:0, 月:1, 火:2...土:6)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + diffToMonday);

  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(monday);
    tempDate.setDate(monday.getDate() + i);
    const y = tempDate.getFullYear();
    const m = String(tempDate.getMonth() + 1).padStart(2, '0');
    const d = String(tempDate.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
  }
  return dates;
};

// 休憩時間の計算（自動休憩控除機能を含む）
export const calculateBreakMinutes = (
  clockInMin: number,
  clockOutMin: number,
  log: AttendanceLog
): number => {
  if (clockInMin >= clockOutMin) return 0;

  // 拘束時間（分）
  const totalDuration = clockOutMin - clockInMin;

  // 1. 手動の休憩入力（管理者による調整等）があればそれを最優先
  if (log.manualBreakMinutes !== null && log.manualBreakMinutes !== undefined) {
    return log.manualBreakMinutes;
  }

  // 2. 打刻による休憩時間があればそれを算出
  let clockedBreak = 0;
  if (log.breakStart && log.breakEnd) {
    const start = timeStringToMinutes(log.breakStart);
    const end = timeStringToMinutes(log.breakEnd);
    if (end > start) {
      clockedBreak = end - start;
    }
  }

  // 3. 自動休憩控除の計算
  // 労働基準法：6時間超で45分以上、8時間超で60分以上の休憩が必要
  let autoDeduction = 0;
  if (totalDuration > 480) { // 8時間超
    autoDeduction = 60;
  } else if (totalDuration > 360) { // 6時間超
    autoDeduction = 45;
  }

  // 実際の打刻による休憩と、自動控除されるべき最低休憩時間の大きい方を適用
  // これにより、打刻漏れがあっても自動控除され、かつ打刻が長ければそちらを適用する
  return Math.max(clockedBreak, autoDeduction);
};

// 従業員の月間給与計算を行うメイン関数
export const calculateMonthlyPayroll = (
  year: number,
  month: number,
  employee: Employee,
  allLogs: AttendanceLog[]
): EmployeeMonthlyPayroll => {
  const daysInMonth = getDaysInMonth(year, month);
  
  // 従業員に紐づくすべての打刻ログを取得（月をまたぐ週の計算のため、全ログから検索できるようにする）
  const logMap = new Map<string, AttendanceLog>();
  allLogs.forEach(log => {
    if (log.employeeId === employee.id) {
      logMap.set(log.date, log);
    }
  });

  // 日ごとの給与詳細を入れる配列
  const dailyDetails: DayPayroll[] = [];
  
  // 通常勤務時間（分）、残業時間（分）、休憩時間（分）、有給取得日数、出勤日数、有給支給額などの集計用
  let totalWorkMinutes = 0;
  let totalOvertimeMinutes = 0;
  let totalBreakMinutes = 0;
  let totalDaysWorked = 0;
  let totalPaidLeaveDaysUsed = 0;

  // 週単位の労働時間を計算するためのキャッシュ
  // キー: 週の月曜日日付 (YYYY-MM-DD), 値: その週の日ごとの実労働時間マップ
  const weeklyWorkMinutesMap = new Map<string, Map<string, number>>();

  // 週40時間超え残業代計算ロジック
  // 特定の日付の週における、その日までの累計実労働時間と、その日の残業時間を算出する
  const getWeeklyOvertimeForDate = (dateStr: string): { overtimeMin: number, workMin: number, breakMin: number } => {
    const weekDates = getWeekDates(dateStr);
    const mondayStr = weekDates[0];

    // 週の各日の実労働時間をまだ計算していない場合は計算してキャッシュする
    if (!weeklyWorkMinutesMap.has(mondayStr)) {
      const dailyWorkMap = new Map<string, number>();
      
      weekDates.forEach(dStr => {
        const dLog = logMap.get(dStr);
        if (!dLog || dLog.isPaidLeave) {
          // 有給休暇日は「実」労働時間としてはカウントしない（労働基準法上の週40時間枠には含めない）
          dailyWorkMap.set(dStr, 0);
          return;
        }

        const clockInMin = timeStringToMinutes(dLog.clockIn);
        const clockOutMin = timeStringToMinutes(dLog.clockOut);
        
        if (clockInMin > 0 && clockOutMin > 0 && clockOutMin > clockInMin) {
          const brk = calculateBreakMinutes(clockInMin, clockOutMin, dLog);
          const rawWork = (clockOutMin - clockInMin) - brk;
          dailyWorkMap.set(dStr, Math.max(0, rawWork));
        } else {
          dailyWorkMap.set(dStr, 0);
        }
      });
      weeklyWorkMinutesMap.set(mondayStr, dailyWorkMap);
    }

    const weekWorkMap = weeklyWorkMinutesMap.get(mondayStr)!;
    
    // 週の月曜日から今日までの労働時間を順番に累積し、40時間（2400分）を超えた分を残業とする
    let cumulativeMinutes = 0;
    let overtimeToday = 0;
    let workToday = weekWorkMap.get(dateStr) || 0;

    // 該当する曜日の打刻ログから休憩時間を取得
    const todayLog = logMap.get(dateStr);
    let breakToday = 0;
    if (todayLog && !todayLog.isPaidLeave) {
      const clockInMin = timeStringToMinutes(todayLog.clockIn);
      const clockOutMin = timeStringToMinutes(todayLog.clockOut);
      if (clockInMin > 0 && clockOutMin > 0) {
        breakToday = calculateBreakMinutes(clockInMin, clockOutMin, todayLog);
      }
    }

    for (const dStr of weekDates) {
      const dailyWork = weekWorkMap.get(dStr) || 0;
      
      if (dStr === dateStr) {
        // 今日の累積計算
        const prevCum = cumulativeMinutes;
        const newCum = prevCum + dailyWork;
        
        if (newCum > 2400) { // 2400分 = 40時間
          if (prevCum >= 2400) {
            overtimeToday = dailyWork;
          } else {
            overtimeToday = newCum - 2400;
          }
        }
        break;
      }
      
      cumulativeMinutes += dailyWork;
    }

    return {
      overtimeMin: overtimeToday,
      workMin: workToday,
      breakMin: breakToday
    };
  };

  // 月の日付ごとに詳細計算を行う
  daysInMonth.forEach(dateStr => {
    const log = logMap.get(dateStr);
    
    // 初期値
    let clockIn: string | null = null;
    let clockOut: string | null = null;
    let isPaidLeave = false;
    let paidLeaveType: 'full' | 'half' | null = null;
    let workMinutes = 0;
    let breakMinutes = 0;
    let overtimeMinutes = 0;
    let transitAllowance = 0; // 交通費は日別では0とし、月合計で一括支給する
    let basePay = 0;
    let overtimePay = 0;
    let paidLeavePay = 0;

    if (log) {
      clockIn = log.clockIn;
      clockOut = log.clockOut;
      isPaidLeave = log.isPaidLeave;
      paidLeaveType = log.paidLeaveType;

      if (isPaidLeave) {
        // 有給休暇の処理
        const count = paidLeaveType === 'half' ? 0.5 : 1;
        totalPaidLeaveDaysUsed += count;
        
        if (employee.type === 'part') {
          // パートのみ有給手当を別途支給 = 有給みなし時間 × 基本時給 × 有給係数(全休:1, 半休:0.5)
          paidLeavePay = Math.round(employee.paidLeaveMinyashiHours * employee.hourlyWage * count);
        } else {
          // 正社員は月給に含まれるため有給手当は0円（追加支給なし）
          paidLeavePay = 0;
        }
      } else {
        // 通常勤務日
        const clockInMin = timeStringToMinutes(clockIn);
        const clockOutMin = timeStringToMinutes(clockOut);
        
        if (clockInMin > 0 && clockOutMin > 0 && clockOutMin > clockInMin) {
          totalDaysWorked += 1;

          // 週40時間超過分の残業時間を含めた労働・休憩時間を取得
          const calc = getWeeklyOvertimeForDate(dateStr);
          workMinutes = calc.workMin;
          breakMinutes = calc.breakMin;
          overtimeMinutes = calc.overtimeMin;

          // 通常勤務時間（残業時間以外）
          const normalWorkMinutes = Math.max(0, workMinutes - overtimeMinutes);
          
          if (employee.type === 'regular') {
            // 正社員：基本給は月額固定のため日別通常基本給は0円
            basePay = 0;
            // 正社員の残業代計算の基礎時給は「月給 / 160」とする
            const baseHourlyWage = employee.hourlyWage / 160;
            overtimePay = Math.round((overtimeMinutes / 60) * baseHourlyWage * 1.25);
          } else {
            // パート：通常勤務分 = 通常勤務時間（分）/ 60 × 基本時給
            basePay = Math.round((normalWorkMinutes / 60) * employee.hourlyWage);
            // パート：割増残業代 = 残業時間（分）/ 60 × 基本時給 × 1.25
            overtimePay = Math.round((overtimeMinutes / 60) * employee.hourlyWage * 1.25);
          }
          
          totalWorkMinutes += workMinutes;
          totalOvertimeMinutes += overtimeMinutes;
          totalBreakMinutes += breakMinutes;
        }
      }
    }

    const dayTotalPay = basePay + overtimePay + paidLeavePay + transitAllowance;

    dailyDetails.push({
      date: dateStr,
      clockIn,
      clockOut,
      isPaidLeave,
      paidLeaveType,
      workMinutes,
      breakMinutes,
      overtimeMinutes,
      transitAllowance,
      basePay,
      overtimePay,
      paidLeavePay,
      dayTotalPay
    });
  });

  // 月合計の計算
  const totalBasePay = employee.type === 'regular'
    ? (totalDaysWorked > 0 ? employee.hourlyWage : 0) // 正社員は出勤実績が1日以上あれば月給満額
    : dailyDetails.reduce((sum, day) => sum + day.basePay, 0); // パートは時間給の累積

  const totalOvertimePay = dailyDetails.reduce((sum, day) => sum + day.overtimePay, 0);
  const totalPaidLeavePay = dailyDetails.reduce((sum, day) => sum + day.paidLeavePay, 0);
  
  // 交通費（月額）：出勤実績が1日以上あれば満額支給
  const totalTransit = totalDaysWorked > 0 ? employee.transitAllowance : 0;

  // 手当（月額）の計算：customAllowancesがあればその合計額、なければ既存のallowance
  const allowanceSource = employee.customAllowances && employee.customAllowances.length > 0
    ? employee.customAllowances.reduce((sum, ca) => sum + (ca.amount || 0), 0)
    : (employee.allowance || 0);

  // 手当（月額）：出勤実績が1日以上あれば満額支給
  const totalAllowance = totalDaysWorked > 0 ? allowanceSource : 0;

  const totalPay = totalBasePay + totalOvertimePay + totalPaidLeavePay + totalTransit + totalAllowance;

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    employeeType: employee.type,
    hourlyWage: employee.hourlyWage,
    totalDaysWorked,
    totalPaidLeaveDaysUsed,
    totalWorkHours: minutesToHoursDecimal(totalWorkMinutes),
    totalOvertimeHours: minutesToHoursDecimal(totalOvertimeMinutes),
    totalBreakHours: minutesToHoursDecimal(totalBreakMinutes),
    basePay: totalBasePay,
    overtimePay: totalOvertimePay,
    paidLeavePay: totalPaidLeavePay,
    transitAllowance: totalTransit,
    allowance: totalAllowance,
    customAllowances: employee.customAllowances,
    totalPay,
    dailyDetails
  };
};

// 給与一覧のCSVデータを生成する関数
export const generatePayrollCSV = (payrollList: EmployeeMonthlyPayroll[]): string => {
  const headers = [
    '従業員名',
    '雇用形態',
    '基本給(時給/月給)',
    '出勤日数',
    '有給取得日数',
    '実労働時間',
    '休憩時間',
    '残業時間(週40時間超)',
    '基本給通常分',
    '割増残業手当(1.25倍)',
    '有給手当',
    '手当',
    '交通費',
    '総支給額'
  ];

  const rows = payrollList.map(p => [
    p.employeeName,
    p.employeeType === 'regular' ? '正社員' : 'パート・アルバイト',
    p.employeeType === 'regular' ? `${p.hourlyWage}円(月給)` : `${p.hourlyWage}円(時給)`,
    p.totalDaysWorked,
    p.totalPaidLeaveDaysUsed,
    p.totalWorkHours,
    p.totalBreakHours,
    p.totalOvertimeHours,
    p.basePay,
    p.overtimePay,
    p.paidLeavePay,
    p.allowance,
    p.transitAllowance,
    p.totalPay
  ]);

  // BOM付きUTF-8（Excelでの文字化け防止）
  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(row => row.map(val => `"${val}"`).join(','))
  ].join('\n');

  return csvContent;
};
