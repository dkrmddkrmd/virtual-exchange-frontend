import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'http://35.247.83.127:8080';

function MyAssets({ token }) {
    const [assetsData, setAssetsData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 💡 충전할 금액을 관리하는 상태 추가
    const [chargeAmount, setChargeAmount] = useState('');
    const [isCharging, setIsCharging] = useState(false);

    // 자산 데이터를 불러오는 함수 (충전 후 재호출을 위해 useCallback 사용)
    const fetchAssets = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/assets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssetsData(response.data);
        } catch (error) {
            console.error("자산 정보 조회 실패:", error);
            alert("자산 정보를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchAssets();
        }
    }, [token, fetchAssets]);

    // 💡 원화 충전 API 호출 핸들러
    const handleCharge = async (e) => {
        e.preventDefault();

        if (!chargeAmount || chargeAmount <= 0) {
            alert("1원 이상 충전 금액을 입력해 주세요.");
            return;
        }

        setIsCharging(true);
        try {
            // 백엔드 컨트롤러 주소에 맞게 수정 (예: /api/charge 또는 /api/assets/charge)
            const response = await axios.patch('http://localhost:8080/api/assets/charge',
                { money: Number(chargeAmount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 컨트롤러가 보내준 성공 메시지(예: 10000원이 정상적으로 충전되었습니다...) 띄우기
            alert(response.data);
            setChargeAmount(''); // 폼 비우기

            // 💡 충전이 완료되면 내 자산 정보를 다시 불러와 화면을 즉시 갱신!
            fetchAssets();
        } catch (error) {
            console.error("충전 실패:", error.response);
            // 백엔드 Validation 에러 메시지가 있다면 띄워주기
            const errorMsg = error.response?.data?.message || "충전에 실패했습니다.";
            alert(errorMsg);
        } finally {
            setIsCharging(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>;
    if (!assetsData) return <div style={{ padding: '50px', textAlign: 'center' }}>자산 데이터가 없습니다.</div>;

    const getColor = (number) => number > 0 ? '#dc3545' : number < 0 ? '#007bff' : '#2b2b2b';

    return (
        <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>💰 내 자산</h2>

            {/* --- 상단: 자산 요약 및 충전 폼 --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: '#6c757d', fontSize: '15px', marginBottom: '10px' }}>보유 KRW (주문 가능)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
                            {assetsData.balance.toLocaleString()}원
                        </div>
                    </div>

                    {/* 💡 충전 폼 UI 추가 */}
                    <form onSubmit={handleCharge} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <input
                            type="number"
                            placeholder="충전 금액 입력"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ced4da' }}
                            min="1"
                        />
                        <button
                            type="submit"
                            disabled={isCharging}
                            style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: isCharging ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                            {isCharging ? '처리중..' : '충전하기'}
                        </button>
                    </form>
                </div>

                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#6c757d', fontSize: '15px', marginBottom: '10px' }}>총 보유자산 (코인 + KRW)</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2b2b2b' }}>
                        {assetsData.totalAssetAmount.toLocaleString()}원
                    </div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#6c757d', fontSize: '15px', marginBottom: '10px' }}>총 평가수익률</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: getColor(assetsData.returnRate) }}>
                        {assetsData.returnRate.toFixed(2)}%
                        <span style={{ fontSize: '16px', marginLeft: '10px' }}>
                            ({assetsData.totalProfitLoss.toLocaleString()}원)
                        </span>
                    </div>
                </div>
            </div>

            {/* --- 하단: 보유 종목 리스트 테이블 (기존 동일) --- */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                        <th style={{ padding: '18px 20px', textAlign: 'left', color: '#495057' }}>보유 종목</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>보유 수량</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>매수 평균가</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>평가 금액</th>
                        <th style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>수익률</th>
                    </tr>
                    </thead>
                    <tbody>
                    {assetsData.holdingList.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                보유 중인 가상자산이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        assetsData.holdingList.map((coin, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #f1f3f5' }}>
                                <td style={{ padding: '18px 20px', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {coin.stockName}
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>
                                    {coin.quantity.toLocaleString()}
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>
                                    {coin.avgPrice.toLocaleString()}원
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: '#2b2b2b' }}>
                                    {coin.evaluationAmount.toLocaleString()}원
                                </td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: getColor(coin.profitRate) }}>
                                    {coin.profitRate.toFixed(2)}%
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MyAssets;