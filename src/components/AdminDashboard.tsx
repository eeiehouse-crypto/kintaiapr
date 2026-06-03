import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  LayoutDashboard, 
  LogOut, 
  Database, 
  Download, 
  Upload, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { Employee, AttendanceLog } from '../types';
import { setupDemoData, DEMO_EMPLOYEES, generateDemoAttendanceLogs } from '../utils/demoData';
import { clearAllData, exportSystemData, importSystemData, saveAdminPassword } from '../utils/storage';
import { DashboardHome } from './DashboardHome';
import { EmployeeManager } from './EmployeeManager';
import { AttendanceEditor } from './AttendanceEditor';
import { PayrollCalculator } from './PayrollCalculator';

interface AdminDashboardProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onSetEmployees: (employees: Employee[]) => void;
  onSetAttendanceLogs: (logs: AttendanceLog[]) => void;
  onNavigateToClockIn: () => void;
}

type TabType = 'home' | 'employees' | 'attendance' | 'payroll';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  employees,
  attendanceLogs,
  onSetEmployees,
  onSetAttendanceLogs,
  onNavigateToClockIn,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [dbMessage, setDbMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // パスワード変更処理
  const handleChangePassword = () => {
    if (!newPassword.trim()) {
      alert('新しいパスワードを入力してください。');
      return;
    }
    saveAdminPassword(newPassword.trim());
    setNewPassword('');
    setDbMessage('管理者パスワードを新しく更新しました！');
    setTimeout(() => setDbMessage(null), 3000);
  };

  // デモデータの生成処理
  const handleGenerateDemoData = () => {
    if (window.confirm('現在のすべてのデータが消去され、10名分のデモデータと2026年5月度の打刻データが生成されます。よろしいですか？')) {
      setupDemoData();
      onSetEmployees(DEMO_EMPLOYEES);
      onSetAttendanceLogs(generateDemoAttendanceLogs());
      setDbMessage('デモデータを生成しました！「2026年5月」を選択すると給与計算を確認できます。');
      setTimeout(() => setDbMessage(null), 5000);
    }
  };

  // 全データのクリア処理
  const handleClearData = () => {
    if (window.confirm('本当にすべてのデータを完全に消去しますか？この操作は取り消せません。')) {
      clearAllData();
      onSetEmployees([]);
      onSetAttendanceLogs([]);
      setDbMessage('すべてのデータを削除しました。');
      setTimeout(() => setDbMessage(null), 3000);
    }
  };

  // データエクスポート (JSONダウンロード)
  const handleExportData = () => {
    const data = exportSystemData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `kintai_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDbMessage('バックアップファイルをダウンロードしました。');
    setTimeout(() => setDbMessage(null), 3000);
  };

  // データインポート (JSONアップロード)
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        const success = importSystemData(result);
        if (success) {
          // 親の状態を更新
          const data = exportSystemData();
          onSetEmployees(data.employees);
          onSetAttendanceLogs(data.attendanceLogs);
          setDbMessage('データのインポートに成功しました！');
          setTimeout(() => setDbMessage(null), 3000);
        } else {
          alert('ファイルの形式が正しくありません。');
        }
      }
    };
    fileReader.readAsText(files[0]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row' }} className="no-print">
      
      {/* 左側：サイドバーナビゲーション */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--wood-dark)',
        color: 'var(--text-light)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0
      }}>
        <div>
          {/* ロゴ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>ア</div>
            <div>
              <h2 style={{ fontSize: '1rem', color: 'white', fontWeight: 900 }}>株式会社アンドデザインラボ</h2>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>管理者システム v1.0</span>
            </div>
          </div>

          {/* ナビゲーションメニュー */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === 'home' ? 'var(--accent-green)' : 'transparent',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === 'home' ? 'bold' : '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              <LayoutDashboard size={18} />
              ダッシュボード
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === 'employees' ? 'var(--accent-green)' : 'transparent',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === 'employees' ? 'bold' : '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Users size={18} />
              従業員マスタ管理
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === 'attendance' ? 'var(--accent-green)' : 'transparent',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === 'attendance' ? 'bold' : '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Calendar size={18} />
              打刻履歴・有給修正
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === 'payroll' ? 'var(--accent-green)' : 'transparent',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'left',
                cursor: 'pointer',
                fontWeight: activeTab === 'payroll' ? 'bold' : '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              <DollarSign size={18} />
              給与計算・明細
            </button>
          </nav>
        </div>

        {/* サイドバー下部：設定 & 打刻画面へ戻る */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={() => setShowDatabaseModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--wood-light)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Database size={14} />
            データ管理・デモ生成
          </button>

          <button
            onClick={onNavigateToClockIn}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, var(--accent-orange) 0%, #B45309 100%)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <LogOut size={16} />
            打刻ステーションへ
          </button>
        </div>
      </aside>

      {/* 右側：メインコンテンツ表示部 */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        backgroundColor: 'var(--wood-cream)',
        position: 'relative'
      }}>
        {/* 通知メッセージエリア */}
        {dbMessage && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, var(--accent-green) 0%, #1E4332 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'float 4s infinite ease-in-out'
          }}>
            <Sparkles size={18} />
            <strong>{dbMessage}</strong>
          </div>
        )}

        {/* 各画面の切り替え表示 */}
        {activeTab === 'home' && (
          <DashboardHome 
            employees={employees} 
            attendanceLogs={attendanceLogs} 
            onNavigateToTab={(tab) => setActiveTab(tab as TabType)}
          />
        )}
        
        {activeTab === 'employees' && (
          <EmployeeManager 
            employees={employees} 
            onUpdateEmployees={onSetEmployees} 
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceEditor 
            employees={employees} 
            attendanceLogs={attendanceLogs} 
            onUpdateLogs={onSetAttendanceLogs} 
          />
        )}

        {activeTab === 'payroll' && (
          <PayrollCalculator 
            employees={employees} 
            attendanceLogs={attendanceLogs} 
          />
        )}
      </main>

      {/* データ管理モーダル */}
      {showDatabaseModal && (
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
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
            borderRadius: 'var(--radius-md)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={24} style={{ color: 'var(--wood-medium)' }} />
              データ管理・バックアップ
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* デモデータ生成 */}
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>🎯 テスト用デモデータの生成</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  10名の模擬従業員と、2026年5月度の1か月分の打刻ログ（有給・残業を含む）を自動生成します。給与計算やダッシュボードの表示テストに最適です。
                </p>
                <button onClick={handleGenerateDemoData} className="btn btn-primary" style={{ fontSize: '0.85rem', width: '100%', gap: '0.25rem' }}>
                  <RefreshCw size={14} />
                  デモデータを一括生成する
                </button>
              </div>

              {/* インポート・エクスポート */}
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📤 バックアップ</h3>
                  <button onClick={handleExportData} className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', padding: '0.5rem', gap: '0.25rem' }}>
                    <Download size={14} />
                    JSONエクスポート
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📥 復元・インポート</h3>
                  <label className="btn btn-outline" style={{ fontSize: '0.8rem', width: '100%', padding: '0.5rem', gap: '0.25rem', display: 'flex', cursor: 'pointer' }}>
                    <Upload size={14} />
                    JSONインポート
                    <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* パスワード変更 */}
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🔑 管理者パスワードの変更
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  管理者画面に入るための認証パスワードを新しく設定します。
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="password"
                    placeholder="新しいパスワードを入力..."
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ fontSize: '0.85rem', flex: 1 }}
                  />
                  <button onClick={handleChangePassword} className="btn btn-primary" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    変更する
                  </button>
                </div>
              </div>

              {/* データ削除 */}
              <div>
                <h3 style={{ fontSize: '1rem', color: '#EF4444', marginBottom: '0.5rem' }}>⚠️ データの完全初期化</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  ブラウザに保存されている従業員マスタ、打刻履歴を含むすべてのデータを削除して完全に初期状態に戻します。
                </p>
                <button onClick={handleClearData} className="btn btn-danger" style={{ fontSize: '0.85rem', width: '100%' }}>
                  全データを削除して初期化
                </button>
              </div>
            </div>

            <button onClick={() => setShowDatabaseModal(false)} className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem', borderColor: 'transparent' }}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
