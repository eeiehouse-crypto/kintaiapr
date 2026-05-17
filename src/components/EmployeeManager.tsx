import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, DollarSign, Clock, Calendar, Link } from 'lucide-react';
import type { Employee } from '../types';

interface EmployeeManagerProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  onUpdateEmployees,
}) => {
  // 編集モード / 新規追加モードの状態管理
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' または 従業員ID
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);

  // フォームの入力項目用状態
  const [formName, setFormName] = useState('');
  const [formKana, setFormKana] = useState('');
  const [formType, setFormType] = useState<'regular' | 'part'>('regular');
  const [formHourlyWage, setFormHourlyWage] = useState(1500);
  const [formTransitAllowance, setFormTransitAllowance] = useState(500);
  const [formCustomAllowanceName1, setFormCustomAllowanceName1] = useState('');
  const [formCustomAllowanceAmount1, setFormCustomAllowanceAmount1] = useState(0);
  const [formCustomAllowanceName2, setFormCustomAllowanceName2] = useState('');
  const [formCustomAllowanceAmount2, setFormCustomAllowanceAmount2] = useState(0);
  const [formCustomAllowanceName3, setFormCustomAllowanceName3] = useState('');
  const [formCustomAllowanceAmount3, setFormCustomAllowanceAmount3] = useState(0);
  const [formPaidLeaveMinyashiHours, setFormPaidLeaveMinyashiHours] = useState(8);
  const [formAnnualPaidLeaveDays, setFormAnnualPaidLeaveDays] = useState(10);
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formIsActive, setFormIsActive] = useState(true);

  // 新規追加ボタン押下時
  const handleAddNew = () => {
    setIsEditing('new');
    setFormName('');
    setFormKana('');
    setFormType('regular');
    setFormHourlyWage(1500);
    setFormTransitAllowance(500);
    setFormCustomAllowanceName1('');
    setFormCustomAllowanceAmount1(0);
    setFormCustomAllowanceName2('');
    setFormCustomAllowanceAmount2(0);
    setFormCustomAllowanceName3('');
    setFormCustomAllowanceAmount3(0);
    setFormPaidLeaveMinyashiHours(8);
    setFormAnnualPaidLeaveDays(10);
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormIsActive(true);
  };

  // 編集開始ボタン押下時
  const handleStartEdit = (emp: Employee) => {
    setIsEditing(emp.id);
    setFormName(emp.name);
    setFormKana(emp.kana);
    setFormType(emp.type);
    setFormHourlyWage(emp.hourlyWage);
    setFormTransitAllowance(emp.transitAllowance);

    const ca = emp.customAllowances || [];
    setFormCustomAllowanceName1(ca[0]?.name || '');
    setFormCustomAllowanceAmount1(ca[0]?.amount || 0);
    setFormCustomAllowanceName2(ca[1]?.name || '');
    setFormCustomAllowanceAmount2(ca[1]?.amount || 0);
    setFormCustomAllowanceName3(ca[2]?.name || '');
    setFormCustomAllowanceAmount3(ca[2]?.amount || 0);

    setFormPaidLeaveMinyashiHours(emp.paidLeaveMinyashiHours);
    setFormAnnualPaidLeaveDays(emp.annualPaidLeaveDays);
    setFormJoinDate(emp.joinDate);
    setFormIsActive(emp.isActive);
  };

  // キャンセル時
  const handleCancel = () => {
    setIsEditing(null);
  };

  // 保存処理
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formKana.trim()) {
      alert('氏名とふりがなは必須項目です。');
      return;
    }

    // ひらがなチェック
    const isHiragana = (str: string) => {
      return /^[ぁ-ん\s]+$/.test(str);
    };
    if (!isHiragana(formKana.replace(/\s+/g, ''))) {
      alert('ふりがなは平仮名（ひらがな）で入力してください。');
      return;
    }

    const customAllowances = [
      { name: formCustomAllowanceName1.trim(), amount: Number(formCustomAllowanceAmount1) || 0 },
      { name: formCustomAllowanceName2.trim(), amount: Number(formCustomAllowanceAmount2) || 0 },
      { name: formCustomAllowanceName3.trim(), amount: Number(formCustomAllowanceAmount3) || 0 }
    ];
    const computedAllowance = customAllowances.reduce((sum, ca) => sum + ca.amount, 0);

    if (isEditing === 'new') {
      // 新規作成
      const newEmp: Employee = {
        id: `emp_${Date.now()}`,
        name: formName,
        kana: formKana,
        type: formType,
        hourlyWage: Number(formHourlyWage),
        transitAllowance: Number(formTransitAllowance),
        allowance: computedAllowance,
        customAllowances,
        paidLeaveMinyashiHours: Number(formPaidLeaveMinyashiHours),
        annualPaidLeaveDays: Number(formAnnualPaidLeaveDays),
        joinDate: formJoinDate,
        isActive: formIsActive,
      };
      onUpdateEmployees([...employees, newEmp]);
    } else {
      // 更新
      const updatedList = employees.map(emp => {
        if (emp.id === isEditing) {
          return {
            ...emp,
            name: formName,
            kana: formKana,
            type: formType,
            hourlyWage: Number(formHourlyWage),
            transitAllowance: Number(formTransitAllowance),
            allowance: computedAllowance,
            customAllowances,
            paidLeaveMinyashiHours: Number(formPaidLeaveMinyashiHours),
            annualPaidLeaveDays: Number(formAnnualPaidLeaveDays),
            joinDate: formJoinDate,
            isActive: formIsActive,
          };
        }
        return emp;
      });
      onUpdateEmployees(updatedList);
    }

    setIsEditing(null);
  };

  // 削除処理
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`${name} さんのマスタ情報を削除しますか？※過去の打刻データが存在する場合、給与計算で不整合が発生する可能性があるため、退職した場合は「退職（無効）」ステータスへの変更を推奨します。`)) {
      onUpdateEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  // 在籍/退職者フィルタ
  const displayedEmployees = employees
    .filter(emp => !filterActiveOnly || emp.isActive)
    .sort((a, b) => a.kana.localeCompare(b.kana)); // 五十音ソート

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ヘッダー・アクション部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>従業員マスタ管理</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            従業員の基本給、手当、有給等の個別契約条件をここで一元管理します。
          </p>
        </div>

        {/* 新規登録ボタン */}
        {!isEditing && (
          <button onClick={handleAddNew} className="btn btn-primary" style={{ gap: '0.25rem' }}>
            <Plus size={18} />
            新しい従業員を登録
          </button>
        )}
      </div>

      {/* 編集・新規追加のフォーム（表示されている時のみ） */}
      {isEditing && (
        <div className="glass-card" style={{ border: '2px solid var(--wood-medium)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditing === 'new' ? '🆕 新しい従業員の登録' : '✍️ 登録情報の編集・個別設定'}
          </h2>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 基本情報 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>氏名</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="山田 太郎"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                  ふりがな（検索用・ひらがなのみ）
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="やまだ たろう"
                  value={formKana}
                  onChange={(e) => setFormKana(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>雇用形態</label>
                <select
                  className="form-select"
                  value={formType}
                  onChange={(e) => {
                    const type = e.target.value as 'regular' | 'part';
                    setFormType(type);
                    // 社員とパートのデフォルト値を自動アシスト
                    if (type === 'regular') {
                      setFormPaidLeaveMinyashiHours(8);
                    } else {
                      setFormPaidLeaveMinyashiHours(5);
                    }
                  }}
                >
                  <option value="regular">正社員</option>
                  <option value="part">パート・アルバイト</option>
                </select>
              </div>
            </div>

            {/* 給与・個別詳細設定 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: 'rgba(140, 106, 92, 0.03)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  <DollarSign size={14} style={{ color: 'var(--accent-orange)' }} />
                  {formType === 'regular' ? '基本給 (月額) (円)' : '時給 (円)'}
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={formHourlyWage}
                  onChange={(e) => setFormHourlyWage(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  <span>🚗</span>
                  交通費 (月額実費) (円)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  value={formTransitAllowance}
                  onChange={(e) => setFormTransitAllowance(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  <Clock size={14} style={{ color: 'var(--accent-green)' }} />
                  有給みなし労働時間 (時間)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="24"
                  value={formPaidLeaveMinyashiHours}
                  onChange={(e) => setFormPaidLeaveMinyashiHours(Number(e.target.value))}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  有給1日取得時の支給時間（個別設定対応）
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.4rem' }}>
                  <Calendar size={14} style={{ color: '#3B82F6' }} />
                  有給休暇年間付与日数 (日)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="365"
                  value={formAnnualPaidLeaveDays}
                  onChange={(e) => setFormAnnualPaidLeaveDays(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* 各種手当自由入力欄 (最大3枠) */}
            <div style={{
              background: 'rgba(140, 106, 92, 0.02)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
              marginTop: '0.25rem'
            }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                <span>🎁</span>
                手当設定（自由記入欄・最大3枠）
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1.5 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="手当名（例: 資格手当）"
                      value={formCustomAllowanceName1}
                      onChange={(e) => setFormCustomAllowanceName1(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      placeholder="金額"
                      value={formCustomAllowanceAmount1 || ''}
                      onChange={(e) => setFormCustomAllowanceAmount1(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.85rem' }}>円</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1.5 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="手当名（例: 役職手当）"
                      value={formCustomAllowanceName2}
                      onChange={(e) => setFormCustomAllowanceName2(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      placeholder="金額"
                      value={formCustomAllowanceAmount2 || ''}
                      onChange={(e) => setFormCustomAllowanceAmount2(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.85rem' }}>円</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1.5 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="手当名（例: 職能手当）"
                      value={formCustomAllowanceName3}
                      onChange={(e) => setFormCustomAllowanceName3(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="0"
                      placeholder="金額"
                      value={formCustomAllowanceAmount3 || ''}
                      onChange={(e) => setFormCustomAllowanceAmount3(Number(e.target.value))}
                    />
                    <span style={{ fontSize: '0.85rem' }}>円</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>※「手当名」と「金額」を入力してください。</span>
                <span>手当合計: <strong style={{ fontSize: '0.9rem', color: 'var(--wood-dark)' }}>{((Number(formCustomAllowanceAmount1) || 0) + (Number(formCustomAllowanceAmount2) || 0) + (Number(formCustomAllowanceAmount3) || 0)).toLocaleString()} 円</strong></span>
              </div>
            </div>

            {/* 状態・入社日 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>入社日</label>
                <input
                  type="date"
                  className="form-input"
                  value={formJoinDate}
                  onChange={(e) => setFormJoinDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>状況</label>
                <select
                  className="form-select"
                  value={formIsActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormIsActive(e.target.value === 'active')}
                >
                  <option value="active">有効</option>
                  <option value="inactive">無効</option>
                </select>
              </div>
            </div>

            {/* ボタン部 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={handleCancel} className="btn btn-outline" style={{ gap: '0.25rem' }}>
                <X size={16} />
                キャンセル
              </button>
              <button type="submit" className="btn btn-primary" style={{ gap: '0.25rem' }}>
                <Save size={16} />
                登録情報を保存
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 従業員一覧リスト */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* フィルタコントロール */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>従業員登録リスト（五十音順）</h2>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>在籍中の従業員のみ表示</span>
          </label>
        </div>

        {/* テーブル表示 */}
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>氏名</th>
                <th>雇用形態</th>
                <th>基本給 (時給/月給)</th>
                <th>手当 (月額実費/内訳)</th>
                <th>交通費 (月額実費)</th>
                <th>有給みなし時間</th>
                <th>有給付与日数</th>
                <th>入社日</th>
                <th>状態</th>
                <th style={{ textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {displayedEmployees.length > 0 ? (
                displayedEmployees.map(emp => (
                  <tr key={emp.id} style={{ opacity: emp.isActive ? 1 : 0.6 }}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.kana}</div>
                    </td>
                    <td>
                      <span className={`badge ${emp.type === 'regular' ? 'badge-regular' : 'badge-part'}`}>
                        {emp.type === 'regular' ? '正社員' : 'パート'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                      {emp.hourlyWage.toLocaleString()}円
                      <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                        ({emp.type === 'regular' ? '月給' : '時給'})
                      </span>
                    </td>
                    <td>
                      {emp.customAllowances && emp.customAllowances.filter(ca => ca.name.trim() !== '' && ca.amount > 0).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                            {emp.allowance.toLocaleString()}円
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.customAllowances
                            .filter(ca => ca.name.trim() !== '' && ca.amount > 0)
                            .map(ca => `${ca.name}:${ca.amount.toLocaleString()}円`)
                            .join(', ')}>
                            {emp.customAllowances
                              .filter(ca => ca.name.trim() !== '' && ca.amount > 0)
                              .map(ca => `${ca.name}:${ca.amount.toLocaleString()}円`)
                              .join(', ')}
                          </span>
                        </div>
                      ) : (
                        emp.allowance > 0 ? (
                          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>{emp.allowance.toLocaleString()}円</span>
                        ) : '-'
                      )}
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif' }}>
                      {emp.transitAllowance > 0 ? `${emp.transitAllowance.toLocaleString()}円` : '無支給'}
                    </td>
                    <td>
                      <span className="badge badge-regular" style={{ backgroundColor: 'rgba(140, 106, 92, 0.08)', color: 'var(--wood-dark)' }}>
                        {emp.paidLeaveMinyashiHours}時間
                      </span>
                    </td>
                    <td>{emp.annualPaidLeaveDays}日</td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>{emp.joinDate}</td>
                    <td>
                      <span className={`badge ${emp.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {emp.isActive ? '有効' : '無効'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            const personalUrl = `${window.location.origin}/?employeeId=${emp.id}`;
                            navigator.clipboard.writeText(personalUrl)
                              .then(() => {
                                alert(`${emp.name} さんの【専用打刻URL】をクリップボードにコピーしました！\n\n${personalUrl}\n\nこのURLを社員の方のスマホやPCに送ってブックマーク（またはホーム画面に登録）してもらってください。`);
                              })
                              .catch(err => {
                                console.error('Failed to copy text: ', err);
                                alert(`コピーに失敗しました。このURLを手動でコピーしてください:\n${personalUrl}`);
                              });
                          }}
                          className="btn btn-outline"
                          style={{ 
                            padding: '0.4rem 0.6rem', 
                            fontSize: '0.8rem', 
                            gap: '0.2rem', 
                            borderColor: 'var(--accent-green)', 
                            color: 'var(--accent-green)' 
                          }}
                        >
                          <Link size={12} />
                          専用URLコピー
                        </button>
                        <button
                          onClick={() => handleStartEdit(emp)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', gap: '0.2rem' }}
                        >
                          <Edit3 size={12} />
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.name)}
                          className="btn btn-outline"
                          style={{ 
                            padding: '0.4rem 0.6rem', 
                            fontSize: '0.8rem', 
                            gap: '0.2rem', 
                            borderColor: '#EF4444', 
                            color: '#EF4444' 
                          }}
                        >
                          <Trash2 size={12} />
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    表示できる従業員がいません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
