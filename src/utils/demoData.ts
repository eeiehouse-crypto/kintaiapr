import type { Employee, AttendanceLog } from '../types';

// ひらがな五十音順で綺麗に並ぶ模擬従業員10名
export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    name: '鈴木 茂',
    kana: 'すずき しげる',
    type: 'regular',
    hourlyWage: 280000, // 月給
    transitAllowance: 15000, // 交通費(月額)
    allowance: 20000, // 手当(月額)
    customAllowances: [
      { name: '資格手当', amount: 10000 },
      { name: '役職手当', amount: 10000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 12,
    joinDate: '2020-04-01',
    isActive: true,
  },
  {
    id: 'emp_2',
    name: '佐藤 健二',
    kana: 'さとう けんじ',
    type: 'regular',
    hourlyWage: 250000, // 月給
    transitAllowance: 10000, // 交通費(月額)
    allowance: 15000, // 手当(月額)
    customAllowances: [
      { name: '職能手当', amount: 10000 },
      { name: '資格手当', amount: 5000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2022-09-15',
    isActive: true,
  },
  {
    id: 'emp_3',
    name: '田中 優子',
    kana: 'たなか ゆうこ',
    type: 'part',
    hourlyWage: 1200, // 時給
    transitAllowance: 5000, // 交通費(月額)
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 5,
    annualPaidLeaveDays: 7,
    joinDate: '2023-05-10',
    isActive: true,
  },
  {
    id: 'emp_4',
    name: '渡辺 誠',
    kana: 'わたなべ まこと',
    type: 'regular',
    hourlyWage: 320000, // 月給
    transitAllowance: 18000, // 交通費(月額)
    allowance: 25000, // 手当(月額)
    customAllowances: [
      { name: '役職手当', amount: 15000 },
      { name: '資格手当', amount: 10000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 14,
    joinDate: '2018-02-01',
    isActive: true,
  },
  {
    id: 'emp_5',
    name: '伊藤 美咲',
    kana: 'いとう みさき',
    type: 'part',
    hourlyWage: 1100, // 時給
    transitAllowance: 4500, // 交通費(月額)
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 4,
    annualPaidLeaveDays: 5,
    joinDate: '2024-03-01',
    isActive: true,
  },
  {
    id: 'emp_6',
    name: '小林 竜也',
    kana: 'こばやし たつや',
    type: 'regular',
    hourlyWage: 230000, // 月給
    transitAllowance: 8000, // 交通費(月額)
    allowance: 10000, // 手当(月額)
    customAllowances: [
      { name: '資格手当', amount: 5000 },
      { name: '現場手当', amount: 5000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-10-01',
    isActive: true,
  },
  {
    id: 'emp_7',
    name: '高橋 さくら',
    kana: 'たかはし さくら',
    type: 'part',
    hourlyWage: 1150, // 時給
    transitAllowance: 6000, // 交通費(月額)
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 6,
    annualPaidLeaveDays: 8,
    joinDate: '2023-11-20',
    isActive: true,
  },
  {
    id: 'emp_8',
    name: '中村 大介',
    kana: 'なかむら だいすけ',
    type: 'regular',
    hourlyWage: 260000, // 月給
    transitAllowance: 0, // 自家用車通勤などで交通費なし
    allowance: 15000, // 手当(月額)
    customAllowances: [
      { name: '職能手当', amount: 10000 },
      { name: '資格手当', amount: 5000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2021-06-01',
    isActive: true,
  },
  {
    id: 'emp_9',
    name: '山中 拓海',
    kana: 'やまなか たくみ',
    type: 'part',
    hourlyWage: 1300, // 時給
    transitAllowance: 5000, // 交通費(月額)
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 6,
    annualPaidLeaveDays: 5,
    joinDate: '2025-01-15',
    isActive: true,
  },
  {
    id: 'emp_10',
    name: '加藤 まゆみ',
    kana: 'かとう まゆみ',
    type: 'part',
    hourlyWage: 1100, // 時給
    transitAllowance: 4000, // 交通費(月額)
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 4,
    annualPaidLeaveDays: 4,
    joinDate: '2024-07-01',
    isActive: false, // 有効ではない従業員
  }
];

// 2026年5月度の1か月分の打刻履歴データを生成する
export const generateDemoAttendanceLogs = (): AttendanceLog[] => {
  const logs: AttendanceLog[] = [];
  const year = 2026;
  const month = 5; // 5月
  const daysInMonth = 31;

  // 各従業員について日ごとのログを作る
  DEMO_EMPLOYEES.forEach(emp => {
    // 退職済みの従業員は基本履歴を生成しない
    if (!emp.isActive) return;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0:日, 1:月 ... 6:土

      // 土日は工務店が休業、またはパートはお休みと仮定（一部例外あり）
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let clockIn: string | null = null;
      let clockOut: string | null = null;
      let breakStart: string | null = null;
      let breakEnd: string | null = null;
      let manualBreakMinutes: number | null = null;
      let isPaidLeave = false;
      let paidLeaveType: 'full' | 'half' | null = null;
      let notes = '';

      if (emp.type === 'regular') {
        // --- 正社員のスケジュール ---
        if (!isWeekend) {
          // 月〜金の通常勤務
          // 稀に有給休暇を取得
          if (day === 12) {
            // 5月12日は有給全休
            isPaidLeave = true;
            paidLeaveType = 'full';
            notes = '有給全休（私用のため）';
          } else if (day === 22) {
            // 5月22日は有給半休
            isPaidLeave = true;
            paidLeaveType = 'half';
            clockIn = '09:00';
            clockOut = '13:00'; // 午前だけ出勤して午後有給
            notes = '有給半休（通院のため午後有給）';
          } else {
            // 通常出勤: 基本は 9:00〜18:00
            // 若干のブレを入れる
            const inHour = 8;
            const inMin = 45 + Math.floor(Math.random() * 20); // 8:45〜9:05
            const outHour = 18;
            const outMin = Math.floor(Math.random() * 25); // 18:00〜18:25

            clockIn = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}`;
            clockOut = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`;

            // 休憩は基本的に 12:00〜13:00 だが、打刻を忘れるケースもある（自動控除が適用される）
            if (day % 4 !== 0) {
              // 4日に3日はちゃんと休憩打刻している
              breakStart = '12:00';
              breakEnd = '13:00';
            } else {
              notes = '休憩打刻漏れ（自動休憩控除適用）';
            }

            // 週40時間超過の残業代をテストするため、特定の週に激務にする
            // 鈴木さん (emp_1) の第2週（5/11〜5/17）は、毎日遅くまで働き、土曜も出勤する
            if (emp.id === 'emp_1' && day >= 11 && day <= 16) {
              if (dayOfWeek === 6) {
                // 土曜出勤 (9:00〜15:00, 休憩なし)
                clockIn = '09:00';
                clockOut = '15:00';
                breakStart = null;
                breakEnd = null;
                notes = '現場応援のため休日出勤';
              } else {
                // 平日残業 (8:50〜20:30)
                clockIn = '08:50';
                clockOut = '20:30';
                breakStart = '12:00';
                breakEnd = '13:00';
                notes = '新築現場工程調整のための残業';
              }
            }
          }
        }
      } else {
        // --- パート・アルバイトのスケジュール ---
        // 火・木・土に出勤すると仮定
        const isPartWorkDay = dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6;
        
        if (isPartWorkDay) {
          // 田中さん (emp_3) は5月26日に有給を取得
          if (emp.id === 'emp_3' && day === 26) {
            isPaidLeave = true;
            paidLeaveType = 'full';
            notes = '有給全休';
          } else {
            // パートは基本的に 9:00〜16:00 (拘束7時間、休憩45分自動控除対象)
            const inHour = 9;
            const inMin = Math.floor(Math.random() * 10); // 9:00〜9:10
            const outHour = 16;
            const outMin = Math.floor(Math.random() * 15); // 16:00〜16:15

            clockIn = `${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}`;
            clockOut = `${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}`;
            
            // パートは休憩打刻せず自動控除（45分）を基本とする
            if (day % 3 === 0) {
              // たまに手動打刻
              breakStart = '12:00';
              breakEnd = '12:45';
            }
          }
        }
      }

      // 出勤または有給のログだけをリストに追加（出勤していない日はログオブジェクト自体を作らないか、空で置く）
      if (clockIn || isPaidLeave) {
        logs.push({
          id: `log_${emp.id}_${dateStr}`,
          employeeId: emp.id,
          date: dateStr,
          clockIn,
          clockOut,
          breakStart,
          breakEnd,
          manualBreakMinutes,
          isPaidLeave,
          paidLeaveType,
          notes
        });
      }
    }
  });

  return logs;
};

// ローカルストレージにデモデータをセットアップする関数
export const setupDemoData = (): void => {
  localStorage.setItem('kintai_employees', JSON.stringify(DEMO_EMPLOYEES));
  localStorage.setItem('kintai_attendance_logs', JSON.stringify(generateDemoAttendanceLogs()));
};
