import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

function MyAssets() {
    const [assetsData, setAssetsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chargeAmount, setChargeAmount] = useState('');
    const [isCharging, setIsCharging] = useState(false);

    const fetchAssets = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/assets');
            setAssetsData(response.data);
        } catch (error) {
            console.error("자산 정보 조회 실패:", error);
            alert("자산 정보를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleCharge = async (e) => {
        e.preventDefault();

        if (!chargeAmount || chargeAmount <= 0) {
            alert("1원 이상 충전 금액을 입력해 주세요.");
            return;
        }

        setIsCharging(true);
        try {
            const response = await axiosInstance.patch('/api/assets/charge', { money: Number(chargeAmount) });
            alert(response.data);
            setChargeAmount('');
            fetchAssets();
        } catch (error) {
            console.error("충전 실패:", error.response);
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

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: '#6c757d', fontSize: '15px', marginBottom: '10px' }}>보유 KRW (주문 가능)</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
                            {assetsData.balance.toLocaleString()}원
                        </div>
                    </div>

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
                                <td style={{ padding: '18px 20px', fontWeight: 'bold', color: '#2b2b2b' }}>{coin.stockName}</td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>{coin.quantity.toLocaleString()}</td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', color: '#495057' }}>{coin.avgPrice.toLocaleString()}원</td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: '#2b2b2b' }}>{coin.evaluationAmount.toLocaleString()}원</td>
                                <td style={{ padding: '18px 20px', textAlign: 'right', fontWeight: 'bold', color: getColor(coin.profitRate) }}>{coin.profitRate.toFixed(2)}%</td>
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
