import type { Employee, AttendanceLog } from '../types';

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp_1',
    name: '岩室　遥斗',
    kana: 'いわむろ　はると',
    type: 'regular',
    hourlyWage: 350000,
    transitAllowance: 0,
    allowance: 40000,
    customAllowances: [
      { name: '役職手当', amount: 20000 },
      { name: '2級建築士手当', amount: 20000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_2',
    name: '内藤　大成',
    kana: 'ないとう　ひろなり',
    type: 'regular',
    hourlyWage: 500000,
    transitAllowance: 0,
    allowance: 70000,
    customAllowances: [
      { name: '役職手当', amount: 50000 },
      { name: '2級建築士手当', amount: 20000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_3',
    name: '丹羽　喬也',
    kana: 'にわ　たかや',
    type: 'regular',
    hourlyWage: 300000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_4',
    name: '都地　涼楓',
    kana: 'つじ　すずか',
    type: 'regular',
    hourlyWage: 300000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_5',
    name: '鈴木　伸雄',
    kana: 'すずき　のぶお',
    type: 'regular',
    hourlyWage: 350000,
    transitAllowance: 0,
    allowance: 5000,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: 'ケイタイ手当', amount: 5000 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_6',
    name: '山田　莉杏',
    kana: 'やまだ　りあん',
    type: 'regular',
    hourlyWage: 300000,
    transitAllowance: 0,
    allowance: 20000,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '2級建築士手当', amount: 20000 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_7',
    name: '波多野　麻子',
    kana: 'はだの　あさこ',
    type: 'regular',
    hourlyWage: 350000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_8',
    name: '今泉　翔太',
    kana: 'いまいずみ　しょうた',
    type: 'regular',
    hourlyWage: 500000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_9',
    name: '武田　輝',
    kana: 'たけだ　てる',
    type: 'regular',
    hourlyWage: 500000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_10',
    name: '鈴木　輝',
    kana: 'すずき　ひかる',
    type: 'regular',
    hourlyWage: 350000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_11',
    name: '菰田　博斗',
    kana: 'こもだ　はくと',
    type: 'regular',
    hourlyWage: 400000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_12',
    name: '塘　剛',
    kana: 'つつみ　ごお',
    type: 'regular',
    hourlyWage: 600000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_13',
    name: '加藤　愛弓',
    kana: 'かとう　あゆみ',
    type: 'regular',
    hourlyWage: 300000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_14',
    name: '神藤　光基',
    kana: 'じんどう　こうき',
    type: 'regular',
    hourlyWage: 300000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_15',
    name: '土橋　美鈴槻',
    kana: 'どばし　みづき',
    type: 'regular',
    hourlyWage: 430000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_16',
    name: '安保　寧音',
    kana: 'あぼ　ねね',
    type: 'regular',
    hourlyWage: 400000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_17',
    name: '成瀬　莉子',
    kana: 'なるせ　りこ',
    type: 'regular',
    hourlyWage: 400000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_18',
    name: '松井　美樹',
    kana: 'まつい　みき',
    type: 'regular',
    hourlyWage: 400000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 'emp_19',
    name: '彦坂　綾音',
    kana: 'ひこさか　あやね',
    type: 'regular',
    hourlyWage: 180000,
    transitAllowance: 0,
    allowance: 0,
    customAllowances: [
      { name: '', amount: 0 },
      { name: '', amount: 0 },
      { name: '', amount: 0 }
    ],
    paidLeaveMinyashiHours: 8,
    annualPaidLeaveDays: 10,
    joinDate: '2024-04-01',
    isActive: true,
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
