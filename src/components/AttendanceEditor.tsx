import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  User, 
  Edit3, 
  Trash2, 
  Save, 
  Info,
  Clock
} from 'lucide-react';
import type { Employee, AttendanceLog } from '../types';
import { 
  getDaysInMonth, 
  getDayOfWeekJP, 
  calculateBreakMinutes, 
  timeStringToMinutes
} from '../utils/payroll';

interface AttendanceEditorProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onUpdateLogs: (logs: AttendanceLog[]) => void;
}

export const AttendanceEditor: React.FC<AttendanceEditorProps> = ({
  employees,
  attendanceLogs,
  onUpdateLogs,
}) => {
  // 現在の日時ベースでデフォルト月を設定
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees.length > 0 ? employees[0].id : ''
  );

  // 編集ダイアログの状態
  const [editingLog, setEditingLog] = useState<Partial<AttendanceLog> | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // 年月の選択肢（過去2年〜今年）
  const years = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 選択された従業員と年月の日付一覧
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // 選択中従業員の今月の打刻データマップ
  const logsForMonth = attendanceLogs.filter(
    log => log.employeeId === selectedEmployeeId && log.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`)
  );

  const logMap = new Map<string, AttendanceLog>();
  logsForMonth.forEach(log => {
    logMap.set(log.date, log);
  });

  // 編集開始
  const handleOpenEdit = (dateStr: string, log?: AttendanceLog) => {
    setEditingDate(dateStr);
    if (log) {
      setEditingLog({ ...log });
    } else {
      setEditingLog({
        id: `log_${selectedEmployeeId}_${dateStr}`,
        employeeId: selectedEmployeeId,
        date: dateStr,
        clockIn: '09:00',
        clockOut: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        manualBreakMinutes: null,
        isPaidLeave: false,
        paidLeaveType: null,
        notes: '',
      });
    }
  };

  // 削除処理
  const handleDeleteLog = (logId: string) => {
    if (window.confirm('この日の打刻データを完全に削除しますか？')) {
      const updatedLogs = attendanceLogs.filter(l => l.id !== logId);
      onUpdateLogs(updatedLogs);
    }
  };

  // 編集ダイアログ保存処理
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !editingDate) return;

    // 時刻の論理チェック
    if (!editingLog.isPaidLeave) {
      const inMin = timeStringToMinutes(editingLog.clockIn || null);
      const outMin = timeStringToMinutes(editingLog.clockOut || null);
      
      if (inMin > 0 && outMin > 0 && inMin >= outMin) {
        alert('退勤時刻は出勤時刻より後の時刻を入力してください。');
        return;
      }

      if (editingLog.breakStart && editingLog.breakEnd) {
        const bStart = timeStringToMinutes(editingLog.breakStart);
        const bEnd = timeStringToMinutes(editingLog.breakEnd);
        if (bStart >= bEnd) {
          alert('休憩戻り時刻は休憩入り時刻より後の時刻を入力してください。');
          return;
        }
      }
    }

    const updatedLog: AttendanceLog = {
      id: editingLog.id || `log_${selectedEmployeeId}_${editingDate}`,
      employeeId: selectedEmployeeId,
      date: editingDate,
      clockIn: editingLog.isPaidLeave && editingLog.paidLeaveType === 'full' ? null : (editingLog.clockIn || null),
      clockOut: editingLog.isPaidLeave && editingLog.paidLeaveType === 'full' ? null : (editingLog.clockOut || null),
      breakStart: editingLog.isPaidLeave ? null : (editingLog.breakStart || null),
      breakEnd: editingLog.isPaidLeave ? null : (editingLog.breakEnd || null),
      manualBreakMinutes: editingLog.manualBreakMinutes !== undefined ? editingLog.manualBreakMinutes : null,
      isPaidLeave: !!editingLog.isPaidLeave,
      paidLeaveType: editingLog.isPaidLeave ? (editingLog.paidLeaveType || 'full') : null,
      notes: editingLog.notes || '',
    };

    // すでにログが存在するか
    const existingIndex = attendanceLogs.findIndex(l => l.id === updatedLog.id);
    let newLogs: AttendanceLog[];

    if (existingIndex > -1) {
      newLogs = [...attendanceLogs];
      newLogs[existingIndex] = updatedLog;
    } else {
      newLogs = [...attendanceLogs, updatedLog];
    }

    onUpdateLogs(newLogs);
    setEditingLog(null);
    setEditingDate(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 上部：フィルターと選択 */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end' }}>
        
        {/* 従業員選択 */}
        <div style={{ flex: '1 1 240px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
            <User size={14} style={{ color: 'var(--wood-medium)' }} />
            対象の従業員
          </label>
          <select
            className="form-select"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          >
            {employees.filter(e => e.isActive).map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.type === 'regular' ? '正社員' : 'パート'})</option>
            ))}
          </select>
        </div>

        {/* 年度選択 */}
        <div style={{ flex: '0 1 120px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
            <CalendarIcon size={14} style={{ color: 'var(--wood-medium)' }} />
            年
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
        <div style={{ flex: '0 1 100px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
            月
          </label>
          <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>

        {/* 状態ヘルプ */}
        <div style={{ flex: '2 1 300px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: '40px', background: 'rgba(140,106,92,0.03)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <Info size={16} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
          <span>
            「打刻忘れ」があった場合は、該当日の行の<strong>「修正・新規」</strong>ボタンを押して手動で打刻時間を登録できます。また、有休休暇（全休・半休）の登録も可能です。
          </span>
        </div>

      </div>

      {/* 履歴テーブル */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {selectedEmployee ? `${selectedEmployee.name} さんの打刻履歴` : '打刻履歴'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            対象期間: {selectedYear}年{selectedMonth}月度
          </p>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>日付 (曜日)</th>
                <th>状態</th>
                <th>出勤時間</th>
                <th>退勤時間</th>
                <th>休憩打刻</th>
                <th>休憩時間(控除)</th>
                <th>実労働時間</th>
                <th>備考</th>
                <th style={{ textAlign: 'right', width: '150px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {selectedEmployee ? (
                daysInMonth.map(dateStr => {
                  const log = logMap.get(dateStr);
                  const dayOfWeek = getDayOfWeekJP(dateStr);
                  const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';

                  let statusBadge = <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>-</span>;
                  let clockIn = '--';
                  let clockOut = '--';
                  let breakStamps = '--';
                  let breakTotal = '0分';
                  let workTotal = '0時間00分';
                  let notes = '';

                  if (log) {
                    notes = log.notes || '';
                    if (log.isPaidLeave) {
                      const typeLabel = log.paidLeaveType === 'half' ? '有給半休' : '有給全休';
                      statusBadge = <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>{typeLabel}</span>;
                      
                      if (log.paidLeaveType === 'half') {
                        clockIn = log.clockIn || '--';
                        clockOut = log.clockOut || '--';
                        // 半休時の実勤務時間
                        const inMin = timeStringToMinutes(log.clockIn);
                        const outMin = timeStringToMinutes(log.clockOut);
                        if (inMin > 0 && outMin > 0) {
                          const workMin = outMin - inMin;
                          workTotal = `${Math.floor(workMin / 60)}時間${String(workMin % 60).padStart(2, '0')}分`;
                        }
                      } else {
                        workTotal = `みなし ${selectedEmployee.paidLeaveMinyashiHours}時間`;
                      }
                    } else {
                      clockIn = log.clockIn || '--';
                      clockOut = log.clockOut || '--';

                      const inMin = timeStringToMinutes(log.clockIn);
                      const outMin = timeStringToMinutes(log.clockOut);

                      if (inMin > 0 && outMin > 0) {
                        statusBadge = <span className="badge badge-active" style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>打刻あり</span>;
                        
                        if (log.breakStart && log.breakEnd) {
                          breakStamps = `${log.breakStart}〜${log.breakEnd}`;
                        }

                        // 休憩時間（自動控除 or 打刻 or 手動）
                        const brk = calculateBreakMinutes(inMin, outMin, log);
                        breakTotal = `${brk}分`;

                        // 実労働時間
                        const workMin = Math.max(0, (outMin - inMin) - brk);
                        workTotal = `${Math.floor(workMin / 60)}時間${String(workMin % 60).padStart(2, '0')}分`;
                      } else {
                        statusBadge = <span className="badge badge-part" style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '0.75rem' }}>打刻未完了</span>;
                      }
                    }
                  }

                  return (
                    <tr 
                      key={dateStr}
                      style={{ 
                        backgroundColor: isWeekend ? 'rgba(140, 106, 92, 0.02)' : 'transparent',
                        color: isWeekend ? 'var(--text-muted)' : 'var(--text-dark)'
                      }}
                    >
                      <td style={{ fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                        {dateStr.split('-')[2]}日 ({dayOfWeek})
                      </td>
                      <td>{statusBadge}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{clockIn}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{clockOut}</td>
                      <td style={{ fontSize: '0.85rem' }}>{breakStamps}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: log?.manualBreakMinutes !== null && log?.manualBreakMinutes !== undefined ? 'bold' : 'normal', color: log?.manualBreakMinutes !== null && log?.manualBreakMinutes !== undefined ? 'var(--accent-orange)' : 'inherit' }}>
                          {breakTotal}
                          {log?.manualBreakMinutes !== null && log?.manualBreakMinutes !== undefined && ' (手動)'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{workTotal}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notes}
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(dateStr, log)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', gap: '0.2rem' }}
                          >
                            <Edit3 size={11} />
                            修正・新規
                          </button>
                          {log && (
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="btn btn-outline"
                              style={{ 
                                padding: '0.35rem 0.5rem', 
                                fontSize: '0.8rem', 
                                gap: '0.2rem', 
                                borderColor: '#EF4444', 
                                color: '#EF4444' 
                              }}
                            >
                              <Trash2 size={11} />
                              削除
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    従業員を選択してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 修正ダイアログ・モーダル */}
      {editingLog && editingDate && (
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
          zIndex: 1000
        }}>
          <div className="glass-card" style={{
            background: 'white',
            maxWidth: '550px',
            width: '90%',
            padding: '2rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: 'var(--accent-orange)' }} />
              勤怠打刻データの調整・登録
            </h2>

            <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--wood-light)', borderRadius: '6px', fontSize: '0.9rem' }}>
              <strong>対象者:</strong> {selectedEmployee?.name} さん<br />
              <strong>対象日:</strong> {editingDate.replace(/-/g, '/')} ({getDayOfWeekJP(editingDate)}曜日)
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 有給休暇設定 */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.05)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(59, 130, 246, 0.15)'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', color: '#1D4ED8' }}>
                  <input
                    type="checkbox"
                    checked={!!editingLog.isPaidLeave}
                    onChange={(e) => {
                      setEditingLog({
                        ...editingLog,
                        isPaidLeave: e.target.checked,
                        // 有休の時はデフォルト全休
                        paidLeaveType: e.target.checked ? 'full' : null,
                      });
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>有給休暇として記録する</span>
                </label>

                {editingLog.isPaidLeave && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>有給種別:</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paidLeaveType"
                        checked={editingLog.paidLeaveType === 'full'}
                        onChange={() => setEditingLog({ ...editingLog, paidLeaveType: 'full' })}
                      />
                      全休 (1日みなし)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="paidLeaveType"
                        checked={editingLog.paidLeaveType === 'half'}
                        onChange={() => setEditingLog({ ...editingLog, paidLeaveType: 'half', clockIn: '09:00', clockOut: '13:00' })}
                      />
                      半休 (午前出勤など)
                    </label>
                  </div>
                )}
              </div>

              {/* 出勤・退勤・休憩打刻（有給全休の場合は非活性） */}
              {(!editingLog.isPaidLeave || editingLog.paidLeaveType === 'half') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>出勤時刻</label>
                      <input
                        type="time"
                        className="form-input"
                        value={editingLog.clockIn || ''}
                        onChange={(e) => setEditingLog({ ...editingLog, clockIn: e.target.value })}
                        required={!editingLog.isPaidLeave || editingLog.paidLeaveType === 'half'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>退勤時刻</label>
                      <input
                        type="time"
                        className="form-input"
                        value={editingLog.clockOut || ''}
                        onChange={(e) => setEditingLog({ ...editingLog, clockOut: e.target.value })}
                        required={!editingLog.isPaidLeave || editingLog.paidLeaveType === 'half'}
                      />
                    </div>
                  </div>

                  {!editingLog.isPaidLeave && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>休憩開始</label>
                          <input
                            type="time"
                            className="form-input"
                            value={editingLog.breakStart || ''}
                            onChange={(e) => setEditingLog({ ...editingLog, breakStart: e.target.value })}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>休憩終了</label>
                          <input
                            type="time"
                            className="form-input"
                            value={editingLog.breakEnd || ''}
                            onChange={(e) => setEditingLog({ ...editingLog, breakEnd: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* 手動休憩控除の上書き */}
                      <div style={{ padding: '0.75rem', backgroundColor: 'rgba(217, 119, 6, 0.03)', borderRadius: '6px', border: '1px solid rgba(217, 119, 6, 0.15)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-orange)' }}>
                          <input
                            type="checkbox"
                            checked={editingLog.manualBreakMinutes !== null && editingLog.manualBreakMinutes !== undefined}
                            onChange={(e) => {
                              setEditingLog({
                                ...editingLog,
                                manualBreakMinutes: e.target.checked ? 60 : null
                              });
                            }}
                          />
                          <span>休憩時間を直接分数で手動指定する (上書き)</span>
                        </label>
                        {editingLog.manualBreakMinutes !== null && editingLog.manualBreakMinutes !== undefined && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '100px', padding: '0.4rem' }}
                              min="0"
                              max="1440"
                              value={editingLog.manualBreakMinutes}
                              onChange={(e) => setEditingLog({ ...editingLog, manualBreakMinutes: Number(e.target.value) })}
                            />
                            <span style={{ fontSize: '0.85rem' }}>分間控除する</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                </div>
              )}

              {/* メモ・備考 */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem' }}>管理者メモ・修正理由</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="例: 出勤打刻忘れのため手動登録。/ 現場都合による時間修正。"
                  value={editingLog.notes || ''}
                  onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* ボタン部 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingLog(null);
                    setEditingDate(null);
                  }} 
                  className="btn btn-outline"
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.25rem' }}>
                  <Save size={16} />
                  修正を保存する
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
