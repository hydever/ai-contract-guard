import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Button, message, Input, Card } from 'antd';
import { SafetyCertificateOutlined, RobotOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import UploadComponent from './components/UploadComponent';
import ResultView from './components/ResultView';
import LetterGenerator from './components/LetterGenerator';
import { API_BASE_URL } from './config';

const { Header, Content, Footer } = Layout;
const { TextArea } = Input;

function App() {
    const [contractText, setContractText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    const handleOcrSuccess = (text) => {
        setContractText(text);
        message.success('文字提取成功，正在开始分析...');
        // Auto-trigger analysis
        handleAnalyze(text);
    };

    const handleAnalyze = async (textToAnalyze) => {
        const text = textToAnalyze || contractText;
        if (!text) {
            message.warning('请先上传合同或手动粘贴文本');
            return;
        }

        setReviewLoading(true);
        setAnalysisResult(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/review`, { text });
            setAnalysisResult(response.data);
            message.success('风险分析完成');
        } catch (error) {
            console.error(error);
            message.error('分析失败，请重试');
        } finally {
            setReviewLoading(false);
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="logo" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SafetyCertificateOutlined style={{ fontSize: '24px' }} />
                    合同卫士 <span style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.8 }}> | 您的全能个人法律顾问 (覆盖消费・职场・租房・借贷)</span>
                </div>
            </Header>
            <Content style={{ padding: '24px 50px' }}>
                <div className="site-layout-content" style={{ margin: '16px 0' }}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={10}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <UploadComponent onOcrSuccess={handleOcrSuccess} />
                                {/* Hidden Text Area for debugging or manual paste if needed, currently simplifying to remove Step 2 Card as requested */}

                                <Card title="原文查看 (可修改)" bordered={false} bodyStyle={{ padding: '12px' }}>
                                    <TextArea
                                        rows={8}
                                        value={contractText}
                                        onChange={(e) => setContractText(e.target.value)}
                                        placeholder="提取的文本将显示在这里..."
                                        style={{ marginBottom: 12, resize: 'none' }}
                                    />
                                    <Button
                                        type="default"
                                        onClick={() => handleAnalyze(contractText)}
                                        loading={reviewLoading}
                                        block
                                    >
                                        重新分析
                                    </Button>
                                </Card>

                                <LetterGenerator />
                            </div>
                        </Col>

                        <Col xs={24} lg={14}>
                            <ResultView analysis={analysisResult} reviewLoading={reviewLoading} />
                        </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '24px 50px' }}>
                <div style={{ marginBottom: '10px', color: '#8c8c8c' }}>
                    合同卫士 Contract Sentinel ©2025 为自由职业者和租客打造
                </div>
                <div style={{ fontSize: '12px', color: '#999', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5' }}>
                    <strong>法律免责声明：</strong>本应用基于人工智能技术提供合同风险分析，仅供参考。
                    AI可能会产生错误或误导性信息（"幻觉"），且无法完全替代专业律师的判断。
                    分析结果不构成任何形式的法律意见或建议。对于因使用本工具而产生的任何直接或间接后果，开发者不承担法律责任。
                    遇到具体法律纠纷，请务必咨询具有执业资格的专业律师。
                </div>
            </Footer>
        </Layout>
    );
}

export default App;
