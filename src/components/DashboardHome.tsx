import React from 'react';
import { Users, LogIn, Coffee, Calendar } from 'lucide-react';
import type { Employee, AttendanceLog } from '../types';

interface DashboardHomeProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onNavigateToTab: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  employees,
  attendanceLogs,
  onNavigateToTab,
}) => {
  // 今日の日付を取得 (YYYY-MM-DD)
  const getTodayStr = (): string => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();

  // アクティブな従業員リスト
  const activeEmployees = employees.filter(emp => emp.isActive);
  const totalActive = activeEmployees.length;

  // 今日の全打刻ログ
  const todayLogs = attendanceLogs.filter(log => log.date === todayStr);

  // ステータス別の人数集計
  let workingCount = 0;
  let breakCount = 0;
  let paidLeaveCount = 0;
  let notClockedInCount = 0;

  activeEmployees.forEach(emp => {
    const log = todayLogs.find(l => l.employeeId === emp.id);
    if (!log) {
      notClockedInCount++;
      return;
    }

    if (log.isPaidLeave) {
      paidLeaveCount++;
    } else if (log.clockIn && !log.clockOut) {
      if (log.breakStart && !log.breakEnd) {
        breakCount++;
      } else {
        workingCount++;
      }
    } else {
      // 退勤済み、あるいは打刻なし
      notClockedInCount++;
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* タイトル部 */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>ダッシュボード概要</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          本日のリアルタイム稼働状況およびシステム全体のサマリーを表示しています。
        </p>
      </div>

      {/* 4つのサマリーカード */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* 在籍従業員数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--wood-medium)' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(140, 106, 92, 0.1)', color: 'var(--wood-medium)' }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>在籍従業員数</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{totalActive} <span style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>名</span></div>
          </div>
        </div>

        {/* 勤務中人数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--accent-green)' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(45, 106, 79, 0.1)', color: 'var(--accent-green)' }}>
            <LogIn size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>現在勤務中</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-green)' }}>{workingCount} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-dark)' }}>名</span></div>
          </div>
        </div>

        {/* 休憩中人数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--accent-orange)' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent-orange)' }}>
            <Coffee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>現在休憩中</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent-orange)' }}>{breakCount} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-dark)' }}>名</span></div>
          </div>
        </div>

        {/* 有給休暇人数 */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>本日有給取得</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3B82F6' }}>{paidLeaveCount} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-dark)' }}>名</span></div>
          </div>
        </div>
      </div>

      {/* 下部：本日の詳細稼働状況テーブル */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>本日の従業員ステータス一覧</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--wood-light)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '500' }}>
            対象日付: {todayStr.replace(/-/g, '/')}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>従業員名</th>
                <th>雇用形態</th>
                <th>本日の状態</th>
                <th>出勤時刻</th>
                <th>退勤時刻</th>
                <th>休憩状況</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              {activeEmployees.length > 0 ? (
                activeEmployees.map(emp => {
                  const log = todayLogs.find(l => l.employeeId === emp.id);
                  
                  // ステータスとバッジの設定
                  let statusBadge = <span className="badge badge-inactive">未出勤</span>;
                  let clockInTime = '--:--';
                  let clockOutTime = '--:--';
                  let breakStatus = '--';
                  let notesText = log?.notes || '';

                  if (log) {
                    if (log.isPaidLeave) {
                      const typeLabel = log.paidLeaveType === 'half' ? '有給半休' : '有給全休';
                      statusBadge = <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563EB' }}>{typeLabel}</span>;
                      clockInTime = log.paidLeaveType === 'half' && log.clockIn ? log.clockIn : '--:--';
                      clockOutTime = log.paidLeaveType === 'half' && log.clockOut ? log.clockOut : '--:--';
                    } else {
                      clockInTime = log.clockIn || '--:--';
                      clockOutTime = log.clockOut || '--:--';

                      if (log.clockIn && !log.clockOut) {
                        if (log.breakStart && !log.breakEnd) {
                          statusBadge = <span className="badge badge-part">休憩中</span>;
                          breakStatus = `${log.breakStart} 〜`;
                        } else {
                          statusBadge = <span className="badge badge-active">勤務中</span>;
                          if (log.breakStart && log.breakEnd) {
                            breakStatus = `${log.breakStart}〜${log.breakEnd}`;
                          }
                        }
                      } else if (log.clockIn && log.clockOut) {
                        statusBadge = <span className="badge badge-inactive">退勤済み</span>;
                        if (log.breakStart && log.breakEnd) {
                          breakStatus = `${log.breakStart}〜${log.breakEnd}`;
                        } else if (log.manualBreakMinutes !== null) {
                          breakStatus = `手動 ${log.manualBreakMinutes}分`;
                        }
                      }
                    }
                  }

                  return (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 'bold' }}>{emp.name}</td>
                      <td>
                        <span className={`badge ${emp.type === 'regular' ? 'badge-regular' : 'badge-part'}`}>
                          {emp.type === 'regular' ? '正社員' : 'パート'}
                        </span>
                      </td>
                      <td>{statusBadge}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{clockInTime}</td>
                      <td style={{ fontFamily: 'Inter, sans-serif' }}>{clockOutTime}</td>
                      <td style={{ fontSize: '0.85rem' }}>{breakStatus}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notesText}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    現在、在籍している従業員はいません。「従業員マスタ管理」から追加してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* クイックリンク */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>💡 はじめてお使いになる方へ</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            給与計算や打刻履歴の機能をすぐに試したい場合は、左下の<strong>「データ管理・デモ生成」</strong>ボタンから、テスト用の模擬データを生成してください。1ヶ月分の稼働データを一括で作成します。
          </p>
        </div>

        <button 
          onClick={() => onNavigateToTab('payroll')}
          className="glass-card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem', 
            textAlign: 'left', 
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: 'white'
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            💴 今月の給与計算を行う &rarr;
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            従業員ごとに設定された個別時給や、週40時間超え残業（1.25倍）、自動休憩控除を反映した給与一覧表を作成し、給与明細を印刷できます。
          </p>
        </button>
      </div>
    </div>
  );
};
