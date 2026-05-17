import React, { useState, useEffect } from 'react';
import { Clock, Search, LogIn, LogOut, Coffee, CheckCircle2, Lock } from 'lucide-react';
import type { Employee, AttendanceLog, AttendanceStatus } from '../types';

interface ClockInScreenProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onAddLog: (newLog: AttendanceLog) => void;
  onUpdateLog: (updatedLog: AttendanceLog) => void;
  onNavigateToAdmin: () => void;
}

export const ClockInScreen: React.FC<ClockInScreenProps> = ({
  employees,
  attendanceLogs,
  onAddLog,
  onUpdateLog,
  onNavigateToAdmin,
}) => {
  // 状態管理
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stampSuccess, setStampSuccess] = useState<{
    show: boolean;
    employeeName: string;
    actionName: string;
    time: string;
  } | null>(null);

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // アクティブな従業員のみを対象とし、名前・ふりがなで絞り込む
  const filteredEmployees = employees
    .filter(emp => emp.isActive)
    .filter(emp => {
      const query = searchQuery.toLowerCase();
      return (
        emp.name.toLowerCase().includes(query) ||
        emp.kana.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.kana.localeCompare(b.kana)); // 五十音順ソート

  // 今日の日付を取得 (YYYY-MM-DD)
  const getTodayStr = (): string => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();

  // 選択された従業員の今日の打刻ログを取得
  const getTodayLog = (employeeId: string): AttendanceLog | undefined => {
    return attendanceLogs.find(log => log.employeeId === employeeId && log.date === todayStr);
  };

  // 選択された従業員の現在の勤怠ステータスを判定
  const getEmployeeStatus = (employeeId: string): AttendanceStatus => {
    const log = getTodayLog(employeeId);
    if (!log) return 'clocked_out';
    if (log.isPaidLeave) return 'clocked_out'; // 有給日は打刻不可

    if (log.clockIn && !log.clockOut) {
      if (log.breakStart && !log.breakEnd) {
        return 'on_break';
      }
      return 'clocked_in';
    }
    return 'clocked_out'; // まだ出勤前、または退勤済み
  };

  // 選択中の従業員の今日のステータス
  const currentStatus = selectedEmployee ? getEmployeeStatus(selectedEmployee.id) : 'clocked_out';
  const todayLog = selectedEmployee ? getTodayLog(selectedEmployee.id) : undefined;

  // 打刻処理
  const handleStamp = (action: 'in' | 'out' | 'break_start' | 'break_end') => {
    if (!selectedEmployee) return;

    const timeStr = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const log = getTodayLog(selectedEmployee.id);

    let actionLabel = '';
    
    if (action === 'in') {
      actionLabel = '出勤';
      if (log) {
        // すでに今日のログがある（有給などの予定が入っている等）
        onUpdateLog({
          ...log,
          clockIn: timeStr,
          isPaidLeave: false, // 出勤打刻したので有給解除
        });
      } else {
        // 新規ログ作成
        onAddLog({
          id: `log_${selectedEmployee.id}_${todayStr}`,
          employeeId: selectedEmployee.id,
          date: todayStr,
          clockIn: timeStr,
          clockOut: null,
          breakStart: null,
          breakEnd: null,
          manualBreakMinutes: null,
          isPaidLeave: false,
          paidLeaveType: null,
          notes: '',
        });
      }
    } else if (action === 'out') {
      actionLabel = '退勤';
      if (log) {
        onUpdateLog({
          ...log,
          clockOut: timeStr,
        });
      }
    } else if (action === 'break_start') {
      actionLabel = '休憩入り';
      if (log) {
        onUpdateLog({
          ...log,
          breakStart: timeStr,
        });
      }
    } else if (action === 'break_end') {
      actionLabel = '休憩戻り';
      if (log) {
        onUpdateLog({
          ...log,
          breakEnd: timeStr,
        });
      }
    }

    // 成功演出の表示
    setStampSuccess({
      show: true,
      employeeName: selectedEmployee.name,
      actionName: actionLabel,
      time: timeStr,
    });

    // 3秒後に非表示、かつ選択解除
    setTimeout(() => {
      setStampSuccess(null);
      setSelectedEmployee(null);
    }, 3000);
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ヘッダー・時計部 */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div>
          <span style={{
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            color: 'var(--wood-medium)',
            fontWeight: 'bold'
          }}>工務店向け勤怠管理システム</span>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>打刻ステーション</h1>
        </div>

        {/* 管理画面ログインボタン */}
        <button 
          onClick={onNavigateToAdmin} 
          className="btn btn-outline"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Lock size={16} />
          管理者画面
        </button>
      </header>

      {/* デジタル時計表示 */}
      <div className="glass-card float-animation" style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(239, 234, 228, 0.6) 100%)'
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 500,
          color: 'var(--wood-medium)',
          marginBottom: '0.5rem',
          letterSpacing: '0.05em'
        }}>
          {currentTime.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
        <div style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          color: 'var(--wood-dark)',
          lineHeight: 1,
          letterSpacing: '0.02em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock size={56} style={{ color: 'var(--accent-green)' }} className="pulse-animation" />
          {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* 左側：従業員選択リスト */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>①</span> 従業員を選択してください
          </h2>

          {/* 検索バー */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="なまえ、ふりがなで検索..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* 従業員リストスクロールエリア */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '0.75rem',
            paddingRight: '0.25rem'
          }}>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(emp => {
                const isSelected = selectedEmployee?.id === emp.id;
                const status = getEmployeeStatus(emp.id);
                const hasClockedOut = getTodayLog(emp.id)?.clockOut !== null && getTodayLog(emp.id)?.clockOut !== undefined;

                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '1rem 0.5rem',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-green)' : 'var(--border-color)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(45, 106, 79, 0.08) 0%, rgba(45, 106, 79, 0.02) 100%)' 
                        : 'white',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      boxShadow: isSelected ? '0 4px 12px rgba(45, 106, 79, 0.15)' : 'none',
                    }}
                  >
                    {/* アバター文字 */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--accent-green)' : 'var(--wood-light)',
                      color: isSelected ? 'white' : 'var(--wood-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      {emp.name.charAt(0)}
                    </div>
                    {/* 名前 */}
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--text-dark)',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>{emp.name}</div>
                    {/* ふりがな */}
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.1rem',
                      textAlign: 'center'
                    }}>{emp.kana}</div>

                    {/* ステータスバッジ */}
                    {status === 'clocked_in' && (
                      <span className="badge badge-regular" style={{ marginTop: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>勤務中</span>
                    )}
                    {status === 'on_break' && (
                      <span className="badge badge-part" style={{ marginTop: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem', backgroundColor: '#FEF3C7', color: '#D97706' }}>休憩中</span>
                    )}
                    {hasClockedOut && (
                      <span className="badge badge-inactive" style={{ marginTop: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>退勤済</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                従業員が見つかりません
              </div>
            )}
          </div>
        </div>

        {/* 右側：打刻操作パネル */}
        <div className="glass-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'stretch',
          height: '600px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 247, 242, 0.75) 100%)'
        }}>
          {selectedEmployee ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              
              {/* 選択された従業員のプロフィール */}
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span className="badge badge-regular" style={{
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem',
                  backgroundColor: selectedEmployee.type === 'regular' ? 'rgba(45, 106, 79, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                  color: selectedEmployee.type === 'regular' ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>
                  {selectedEmployee.type === 'regular' ? '正社員' : 'パート・アルバイト'}
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.2rem' }}>{selectedEmployee.name} さん</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedEmployee.kana}</p>
              </div>

              {/* 今日の打刻ステータスサマリー */}
              <div style={{
                background: 'rgba(140, 106, 92, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                margin: '1rem 0',
                border: '1px dashed var(--border-color)'
              }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--wood-medium)', marginBottom: '0.5rem', textAlign: 'center' }}>
                  本日の打刻状況
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: '#fff', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>出勤</span>
                    <strong style={{ color: todayLog?.clockIn ? 'var(--accent-green)' : '#94A3B8' }}>
                      {todayLog?.clockIn || '--:--'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: '#fff', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>退勤</span>
                    <strong style={{ color: todayLog?.clockOut ? 'var(--accent-green)' : '#94A3B8' }}>
                      {todayLog?.clockOut || '--:--'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: '#fff', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>休憩入</span>
                    <strong style={{ color: todayLog?.breakStart ? 'var(--accent-orange)' : '#94A3B8' }}>
                      {todayLog?.breakStart || '--:--'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', background: '#fff', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>休憩戻</span>
                    <strong style={{ color: todayLog?.breakEnd ? 'var(--accent-orange)' : '#94A3B8' }}>
                      {todayLog?.breakEnd || '--:--'}
                    </strong>
                  </div>
                </div>
                {todayLog?.notes && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    備考: {todayLog.notes}
                  </div>
                )}
              </div>

              {/* 打刻ボタン */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                margin: '1rem 0'
              }}>
                {/* 出勤ボタン */}
                <button
                  onClick={() => handleStamp('in')}
                  disabled={currentStatus !== 'clocked_out' || (todayLog?.clockOut !== null && todayLog?.clockOut !== undefined)}
                  className="btn btn-primary"
                  style={{
                    height: '100px',
                    flexDirection: 'column',
                    fontSize: '1.25rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <LogIn size={28} />
                  出勤
                </button>

                {/* 退勤ボタン */}
                <button
                  onClick={() => handleStamp('out')}
                  disabled={currentStatus !== 'clocked_in'}
                  className="btn btn-secondary"
                  style={{
                    height: '100px',
                    flexDirection: 'column',
                    fontSize: '1.25rem',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <LogOut size={28} />
                  退勤
                </button>

                {/* 休憩開始ボタン */}
                <button
                  onClick={() => handleStamp('break_start')}
                  disabled={currentStatus !== 'clocked_in'}
                  className="btn btn-outline"
                  style={{
                    height: '90px',
                    flexDirection: 'column',
                    fontSize: '1.1rem',
                    borderColor: 'var(--accent-orange)',
                    color: 'var(--accent-orange)',
                    background: 'white',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Coffee size={24} />
                  休憩入り
                </button>

                {/* 休憩終了ボタン */}
                <button
                  onClick={() => handleStamp('break_end')}
                  disabled={currentStatus !== 'on_break'}
                  className="btn btn-outline"
                  style={{
                    height: '90px',
                    flexDirection: 'column',
                    fontSize: '1.1rem',
                    borderColor: 'var(--accent-green)',
                    color: 'var(--accent-green)',
                    background: 'white',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Clock size={24} />
                  休憩戻り
                </button>
              </div>

              {/* 選択解除 */}
              <button
                onClick={() => setSelectedEmployee(null)}
                className="btn btn-outline"
                style={{ width: '100%', borderColor: 'transparent', color: 'var(--text-muted)' }}
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              height: '100%'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(140, 106, 92, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wood-medium)'
              }}>
                <Clock size={40} />
              </div>
              <p style={{ fontWeight: '500', fontSize: '1.1rem', color: 'var(--wood-dark)' }}>
                左側の従業員一覧から<br />あなたのお名前を選んでください。
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                選ぶと、出勤・退勤などの打刻ボタンが表示されます。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 打刻完了演出ポップアップ */}
      {stampSuccess && stampSuccess.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(44, 34, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="glass-card float-animation" style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: '2px solid var(--accent-green)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <CheckCircle2 size={72} style={{ color: 'var(--accent-green)' }} className="pulse-animation" />
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--wood-dark)', marginBottom: '0.5rem' }}>
                打刻完了
              </h2>
              <p style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                {stampSuccess.employeeName} さん
              </p>
              <p style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--accent-green)',
                margin: '0.5rem 0'
              }}>
                {stampSuccess.actionName} {stampSuccess.time}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                今日も一日お疲れ様です！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
