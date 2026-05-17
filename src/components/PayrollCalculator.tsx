import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Printer, 
  FileText, 
  Info,
  X
} from 'lucide-react';
import type { Employee, AttendanceLog, EmployeeMonthlyPayroll } from '../types';
import { calculateMonthlyPayroll, generatePayrollCSV, getDayOfWeekJP } from '../utils/payroll';

interface PayrollCalculatorProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
}

export const PayrollCalculator: React.FC<PayrollCalculatorProps> = ({
  employees,
  attendanceLogs,
}) => {
  // 年月の選択状態
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-indexed

  // 選択された明細書の従業員データ
  const [selectedSlip, setSelectedSlip] = useState<EmployeeMonthlyPayroll | null>(null);

  // 年月の選択肢（過去2年〜今年）
  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 在籍従業員全員分の月間給与を計算する
  const activeEmployees = employees.filter(emp => emp.isActive);
  const payrollList: EmployeeMonthlyPayroll[] = activeEmployees.map(emp => {
    return calculateMonthlyPayroll(selectedYear, selectedMonth, emp, attendanceLogs);
  });

  // 全従業員の総支給額合計
  const totalCompanyPayout = payrollList.reduce((sum, item) => sum + item.totalPay, 0);

  // CSVエクスポート処理
  const handleExportCSV = () => {
    if (payrollList.length === 0) {
      alert('給与データがありません。');
      return;
    }
    const csvContent = generatePayrollCSV(payrollList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `給与集計_${selectedYear}年${selectedMonth}月度.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 個人給与明細書の印刷処理
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 上部：年月選択とアクション */}
      <div className="glass-card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* 年度選択 */}
          <div style={{ width: '130px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
              <CalendarIcon size={14} style={{ color: 'var(--wood-medium)' }} />
              対象年度
            </label>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>

          {/* 月度選択 */}
          <div style={{ width: '110px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
              対象月度
            </label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map(m => <option key={m} value={m}>{m}月</option>)}
            </select>
          </div>
          
          {/* 集計サマリー表示 */}
          <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(140, 106, 92, 0.05)', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '43px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>
              当月総人件費 (総支給額): <strong style={{ fontSize: '1.1rem', color: 'var(--accent-green)' }}>{totalCompanyPayout.toLocaleString()}円</strong> (対象 {payrollList.length}名)
            </span>
          </div>
        </div>

        {/* CSVエクスポートボタン */}
        <button onClick={handleExportCSV} className="btn btn-outline" style={{ gap: '0.25rem' }}>
          <Download size={16} />
          給与一覧CSVエクスポート
        </button>
      </div>

      {/* 計算の前提ルール通知 */}
      <div style={{ display: 'flex', gap: '0.75rem', padding: '1rem', backgroundColor: 'rgba(217, 119, 6, 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.15)', fontSize: '0.8rem', color: 'var(--wood-dark)' }}>
        <Info size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
        <div>
          <strong>💼 給与計算ルールについて:</strong>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <li><strong>自動休憩控除:</strong> 拘束6時間超で45分、8時間超で60分の休憩時間を自動控除します（手動の休憩打刻がある場合は手動を優先）。</li>
            <li><strong>週40時間超え残業:</strong> 月曜始まり〜日曜終わりの週40時間を超えた実労働時間は、1.25倍の割増残業代として個別に計算されます（正社員は月給 / 160時間を基礎時給とします）。</li>
            <li><strong>有給休暇手当:</strong> パートは個別設定の「有給みなし労働時間 × 基本時給」を支給、正社員は月給に含まれるため0円（追加支給なし）となります。</li>
            <li><strong>手当・交通費:</strong> 月額固定の手当と交通費は、当月に1日以上出勤実績（有休含む）があれば満額支給されます。</li>
          </ul>
        </div>
      </div>

      {/* 給与計算一覧テーブル */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {selectedYear}年{selectedMonth}月度 給与支払総額一覧
        </h2>

        <div className="table-wrapper">
          <table className="custom-table" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th>従業員名</th>
                <th>基本給 (時給/月給)</th>
                <th>出勤 / 有給</th>
                <th>実労働時間</th>
                <th>割増残業時間</th>
                <th>通常基本給</th>
                <th>割増残業代</th>
                <th>有給手当</th>
                <th>手当</th>
                <th>交通費</th>
                <th style={{ color: 'var(--accent-green)' }}>総支給額</th>
                <th style={{ textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {payrollList.length > 0 ? (
                payrollList.map(p => (
                  <tr key={p.employeeId}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{p.employeeName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.employeeType === 'regular' ? '正社員' : 'パート'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>
                      {p.hourlyWage.toLocaleString()}円
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                        ({p.employeeType === 'regular' ? '月給' : '時給'})
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{p.totalDaysWorked}日</span>
                      {p.totalPaidLeaveDaysUsed > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#2563EB', marginLeft: '0.25rem' }}>
                          (有休 {p.totalPaidLeaveDaysUsed}日)
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>{p.totalWorkHours}時間</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', color: p.totalOvertimeHours > 0 ? 'var(--accent-orange)' : 'inherit', fontWeight: p.totalOvertimeHours > 0 ? 'bold' : 'normal' }}>
                      {p.totalOvertimeHours > 0 ? `${p.totalOvertimeHours}時間` : '0時間'}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>{p.basePay.toLocaleString()}円</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', color: p.overtimePay > 0 ? 'var(--accent-orange)' : 'inherit' }}>
                      {p.overtimePay > 0 ? `${p.overtimePay.toLocaleString()}円` : '-'}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif', color: p.paidLeavePay > 0 ? '#2563EB' : 'inherit' }}>
                      {p.paidLeavePay > 0 ? `${p.paidLeavePay.toLocaleString()}円` : '-'}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>
                      {p.allowance > 0 ? `${p.allowance.toLocaleString()}円` : '-'}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>{p.transitAllowance.toLocaleString()}円</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: '900', color: 'var(--accent-green)', fontSize: '1rem' }}>
                      {p.totalPay.toLocaleString()}円
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedSlip(p)}
                          className="btn btn-outline"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', gap: '0.2rem', borderColor: 'var(--wood-medium)' }}
                        >
                          <FileText size={12} />
                          給与明細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    従業員が登録されていないか、対象月のデータがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 給与明細モーダル (詳細表示 ＆ A4印刷対応) */}
      {selectedSlip && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(44, 34, 30, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} className="no-print">
          <div className="glass-card" style={{
            background: 'white',
            maxWidth: '800px',
            width: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            {/* モーダルヘッダー（印刷非表示） */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }} className="no-print">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>📄 給与明細書の確認・印刷</h2>
              <button 
                onClick={() => setSelectedSlip(null)} 
                className="btn btn-outline" 
                style={{ border: 'none', padding: '0.25rem', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* 明細印刷用ドキュメント本体（ここから上が印刷時に非表示になり、ここがA4印刷される） */}
            <div id="print-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#000', fontFamily: 'var(--font-family)' }}>
              
              {/* 明細書ヘッダー */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '0.1em', color: '#000' }}>給与支払明細書</h1>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedYear}年 {selectedMonth}月度</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                  <strong style={{ fontSize: '1.1rem', display: 'block' }}>和工務店</strong>
                  <span>〒000-0000 〇〇県〇〇市1-2-3</span><br />
                  <span>TEL: 00-0000-0000</span>
                </div>
              </div>

              {/* 従業員名・支給日 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>従業員名: </span>
                  <strong style={{ fontSize: '1.4rem', borderBottom: '2px solid #000', padding: '0 1rem 0.2rem 0' }}>
                    {selectedSlip.employeeName} 殿
                  </strong>
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem', color: '#444' }}>
                    ({selectedSlip.employeeType === 'regular' ? '正社員' : 'パート'})
                  </span>
                </div>
                <div style={{ alignSelf: 'flex-end', fontSize: '0.9rem' }}>
                  {selectedSlip.employeeType === 'regular' ? (
                    <span>基本給 (月給): <strong>{selectedSlip.hourlyWage.toLocaleString()}円</strong></span>
                  ) : (
                    <span>時給単価: <strong>{selectedSlip.hourlyWage.toLocaleString()}円</strong></span>
                  )}
                </div>
              </div>

              {/* 勤怠集計ブロック */}
              <div>
                <h3 style={{ fontSize: '0.95rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【勤怠項目】</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #000', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem' }}>
                  <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>出勤日数</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.totalDaysWorked} 日</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>有休消化日数</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.totalPaidLeaveDaysUsed} 日</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>実労働時間</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.totalWorkHours} H</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>休憩時間合計</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.totalBreakHours} H</strong>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>割増残業時間</div>
                    <strong style={{ fontSize: '1.1rem', color: selectedSlip.totalOvertimeHours > 0 ? 'var(--accent-orange)' : 'inherit' }}>{selectedSlip.totalOvertimeHours} H</strong>
                  </div>
                </div>
              </div>

              {/* 支給計算ブロック */}
              <div>
                <h3 style={{ fontSize: '0.95rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【支給内訳】</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #000', borderRadius: '4px', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>基本給 (通常労働分)</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.basePay.toLocaleString()} 円</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>割増残業手当 (1.25倍)</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.overtimePay.toLocaleString()} 円</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>有休手当</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.paidLeavePay.toLocaleString()} 円</strong>
                  </div>
                  <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>各種手当</div>
                    <strong style={{ fontSize: '1.1rem' }}>{(selectedSlip.allowance || 0).toLocaleString()} 円</strong>
                  </div>
                  <div style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#555', fontSize: '0.8rem', marginBottom: '0.2rem' }}>通勤交通費</div>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedSlip.transitAllowance.toLocaleString()} 円</strong>
                  </div>
                </div>

                {/* 各種手当内訳 */}
                {selectedSlip.customAllowances && selectedSlip.customAllowances.filter(ca => ca.name.trim() !== '' && ca.amount > 0).length > 0 && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#333', 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB', 
                    padding: '0.5rem 0.75rem', 
                    borderRadius: '4px',
                    marginTop: '-0.75rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--wood-dark)' }}>手当内訳:</span>
                    {selectedSlip.customAllowances
                      .filter(ca => ca.name.trim() !== '' && ca.amount > 0)
                      .map((ca, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {ca.name}: <strong style={{ marginLeft: '0.2rem' }}>{ca.amount.toLocaleString()}円</strong>
                        </span>
                      ))}
                  </div>
                )}

                {/* 差引支給額合計 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8f8f8',
                  border: '2px solid #000',
                  borderRadius: '4px',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem'
                }}>
                  <strong style={{ letterSpacing: '0.1em' }}>差引総支給額 (支払総額):</strong>
                  <strong style={{ fontSize: '1.75rem', textDecoration: 'underline' }}>
                    ￥{selectedSlip.totalPay.toLocaleString()} -
                  </strong>
                </div>
              </div>

              {/* 日別内訳テーブル (A4印刷時に下部に綺麗に収まる) */}
              <div>
                <h3 style={{ fontSize: '0.95rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【日別労働内訳】</h3>
                <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#eee', borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '0.4rem' }}>日付 (曜日)</th>
                        <th style={{ padding: '0.4rem' }}>区分</th>
                        <th style={{ padding: '0.4rem' }}>出勤</th>
                        <th style={{ padding: '0.4rem' }}>退勤</th>
                        <th style={{ padding: '0.4rem' }}>休憩</th>
                        <th style={{ padding: '0.4rem' }}>実労働</th>
                        <th style={{ padding: '0.4rem' }}>残業(週40h超)</th>
                        <th style={{ padding: '0.4rem', textAlign: 'right' }}>日支給合計</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSlip.dailyDetails.map(day => {
                        const dayOfWeek = getDayOfWeekJP(day.date);
                        const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';
                        const dateDayStr = `${day.date.split('-')[2]}日 (${dayOfWeek})`;
                        
                        let label = '-';
                        if (day.isPaidLeave) {
                          label = day.paidLeaveType === 'half' ? '半休' : '有休';
                        } else if (day.workMinutes > 0) {
                          label = '出勤';
                        }

                        // 出退勤表示
                        const cIn = day.clockIn || '-';
                        const cOut = day.clockOut || '-';
                        
                        // 時間表示
                        const brkStr = day.breakMinutes > 0 ? `${day.breakMinutes}分` : '-';
                        const workH = day.workMinutes > 0 ? `${Math.floor(day.workMinutes / 60)}h${String(day.workMinutes % 60).padStart(2, '0')}m` : '-';
                        const otH = day.overtimeMinutes > 0 ? `${Math.floor(day.overtimeMinutes / 60)}h${String(day.overtimeMinutes % 60).padStart(2, '0')}m` : '-';

                        if (day.workMinutes === 0 && !day.isPaidLeave) {
                          return null; // 休日は明細テーブルを詰めるために非表示
                        }

                        return (
                          <tr key={day.date} style={{ borderBottom: '1px solid #eee', backgroundColor: isWeekend ? '#FAF8F5' : 'transparent' }}>
                            <td style={{ padding: '0.4rem', fontWeight: 'bold' }}>{dateDayStr}</td>
                            <td style={{ padding: '0.4rem' }}>{label}</td>
                            <td style={{ padding: '0.4rem', fontFamily: 'Inter, sans-serif' }}>{cIn}</td>
                            <td style={{ padding: '0.4rem', fontFamily: 'Inter, sans-serif' }}>{cOut}</td>
                            <td style={{ padding: '0.4rem' }}>{brkStr}</td>
                            <td style={{ padding: '0.4rem', fontWeight: 'bold' }}>{workH}</td>
                            <td style={{ padding: '0.4rem', color: day.overtimeMinutes > 0 ? 'var(--accent-orange)' : 'inherit', fontWeight: day.overtimeMinutes > 0 ? 'bold' : 'normal' }}>{otH}</td>
                            <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 'bold' }}>
                              {day.dayTotalPay > 0 ? `${day.dayTotalPay.toLocaleString()}円` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* モーダルフッター（印刷非表示） */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }} className="no-print">
              <button onClick={() => setSelectedSlip(null)} className="btn btn-outline">
                閉じる
              </button>
              <button onClick={handlePrintSlip} className="btn btn-primary" style={{ gap: '0.25rem' }}>
                <Printer size={16} />
                A4サイズで印刷する
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 印刷専用レイアウト（ブラウザ印刷時にのみ表示される） */}
      {selectedSlip && (
        <div className="print-only print-page-break" style={{ color: '#000', background: '#fff', padding: '10px' }}>
          {/* print-areaと同一のDOMがプリント出力されます */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#000', margin: 0 }}>給与支払明細書</h1>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedYear}年 {selectedMonth}月度</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                <strong style={{ fontSize: '1.2rem', display: 'block' }}>和工務店</strong>
                <span>〒000-0000 〇〇県〇〇市1-2-3</span><br />
                <span>TEL: 00-0000-0000</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
              <div>
                <span>従業員名: </span>
                <strong style={{ fontSize: '1.5rem', borderBottom: '2px solid #000', padding: '0 1rem 0.2rem 0' }}>
                  {selectedSlip.employeeName} 殿
                </strong>
                <span style={{ fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                  ({selectedSlip.employeeType === 'regular' ? '正社員' : 'パート'})
                </span>
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                {selectedSlip.employeeType === 'regular' ? (
                  <span>基本給 (月給): <strong>{selectedSlip.hourlyWage.toLocaleString()}円</strong></span>
                ) : (
                  <span>時給単価: <strong>{selectedSlip.hourlyWage.toLocaleString()}円</strong></span>
                )}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【勤怠項目】</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #000', borderRadius: '4px', textAlign: 'center', fontSize: '0.95rem' }}>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                  <div>出勤日数</div>
                  <strong>{selectedSlip.totalDaysWorked} 日</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                  <div>有休消化日数</div>
                  <strong>{selectedSlip.totalPaidLeaveDaysUsed} 日</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                  <div>実労働時間</div>
                  <strong>{selectedSlip.totalWorkHours} H</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                  <div>休憩時間合計</div>
                  <strong>{selectedSlip.totalBreakHours} H</strong>
                </div>
                <div>
                  <div>割増残業時間</div>
                  <strong>{selectedSlip.totalOvertimeHours} H</strong>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【支給内訳】</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid #000', borderRadius: '4px', textAlign: 'center', fontSize: '0.95rem', marginBottom: '1rem' }}>
                <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                  <div>基本給 (通常労働分)</div>
                  <strong>{selectedSlip.basePay.toLocaleString()} 円</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                  <div>割増残業手当 (1.25倍)</div>
                  <strong>{selectedSlip.overtimePay.toLocaleString()} 円</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                  <div>有休手当</div>
                  <strong>{selectedSlip.paidLeavePay.toLocaleString()} 円</strong>
                </div>
                <div style={{ borderRight: '1px solid #000', padding: '0.75rem 0.5rem' }}>
                  <div>各種手当</div>
                  <strong>{(selectedSlip.allowance || 0).toLocaleString()} 円</strong>
                </div>
                <div style={{ padding: '0.75rem 0.5rem' }}>
                  <div>通勤交通費</div>
                  <strong>{selectedSlip.transitAllowance.toLocaleString()} 円</strong>
                </div>
              </div>

              {/* 各種手当内訳（印刷用） */}
              {selectedSlip.customAllowances && selectedSlip.customAllowances.filter(ca => ca.name.trim() !== '' && ca.amount > 0).length > 0 && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#000', 
                  border: '1px solid #000', 
                  padding: '0.4rem 0.75rem', 
                  borderRadius: '4px',
                  marginTop: '-0.75rem',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontWeight: 'bold' }}>手当内訳:</span>
                  {selectedSlip.customAllowances
                    .filter(ca => ca.name.trim() !== '' && ca.amount > 0)
                    .map((ca, i) => (
                      <span key={i}>
                        {ca.name}: <strong>{ca.amount.toLocaleString()}円</strong>
                      </span>
                    ))}
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8f8f8',
                border: '2px solid #000',
                borderRadius: '4px',
                padding: '1rem 1.5rem',
                fontSize: '1.2rem'
              }}>
                <strong>差引総支給額 (支払総額):</strong>
                <strong style={{ fontSize: '2rem', textDecoration: 'underline' }}>
                  ￥{selectedSlip.totalPay.toLocaleString()} -
                </strong>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', borderLeft: '3px solid #000', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>【日別労働内訳】</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #000' }}>
                <thead>
                  <tr style={{ background: '#eee', borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>日付 (曜日)</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>区分</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>出勤</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>退勤</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>休憩</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>実労働</th>
                    <th style={{ padding: '0.4rem', borderRight: '1px solid #000' }}>残業(週40h超)</th>
                    <th style={{ padding: '0.4rem', textAlign: 'right' }}>日支給合計</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSlip.dailyDetails.map(day => {
                    const dayOfWeek = getDayOfWeekJP(day.date);
                    const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';
                    
                    let label = '-';
                    if (day.isPaidLeave) {
                      label = day.paidLeaveType === 'half' ? '半休' : '有休';
                    } else if (day.workMinutes > 0) {
                      label = '出勤';
                    }

                    if (day.workMinutes === 0 && !day.isPaidLeave) {
                      return null; // 休日は明細テーブルを詰めるために非表示
                    }

                    return (
                      <tr key={day.date} style={{ borderBottom: '1px solid #ccc', backgroundColor: isWeekend ? '#FAF8F5' : 'transparent' }}>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc', fontWeight: 'bold' }}>{day.date.split('-')[2]}日 ({dayOfWeek})</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc' }}>{label}</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc' }}>{day.clockIn || '-'}</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc' }}>{day.clockOut || '-'}</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc' }}>{day.breakMinutes > 0 ? `${day.breakMinutes}分` : '-'}</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc', fontWeight: 'bold' }}>{day.workMinutes > 0 ? `${Math.floor(day.workMinutes / 60)}h${String(day.workMinutes % 60).padStart(2, '0')}m` : '-'}</td>
                        <td style={{ padding: '0.4rem', borderRight: '1px solid #ccc', fontWeight: 'bold' }}>{day.overtimeMinutes > 0 ? `${Math.floor(day.overtimeMinutes / 60)}h${String(day.overtimeMinutes % 60).padStart(2, '0')}m` : '-'}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right', fontWeight: 'bold' }}>
                          {day.dayTotalPay > 0 ? `${day.dayTotalPay.toLocaleString()}円` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 押印欄 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '60px', border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '2px' }}>
                <span style={{ borderBottom: '1px solid #000', width: '100%', textAlign: 'center' }}>承認</span>
                <span></span>
              </div>
              <div style={{ width: '80px', height: '60px', border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '2px' }}>
                <span style={{ borderBottom: '1px solid #000', width: '100%', textAlign: 'center' }}>担当</span>
                <span></span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
