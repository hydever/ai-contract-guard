import React, { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { CopyOutlined, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { TextArea } = Input;
const { Title } = Typography;

const LetterGenerator = () => {
    const [disputeType, setDisputeType] = useState('deposit_refund');
    const [context, setContext] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [loading, setLoading] = useState(false);

    const generateLetter = async () => {
        if (!context) {
            message.warning('请输入简要背景信息');
            return;
        }

        setLoading(true);
        setGeneratedLetter('');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/generate_letter`, {
                dispute_type: disputeType,
                context: context
            });
            setGeneratedLetter(response.data.letter_content);
            message.success('维权函已生成');
        } catch (error) {
            console.error('Generation Error:', error);
            message.error('生成失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        message.success('维权函已复制到剪贴板！');
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generatedLetter], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "legal_letter.txt";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        message.success('维权函已下载！');
    };



    return (
        <Card title={<span><SafetyCertificateOutlined /> 3. 维权函生成器 (AI辅助)</span>} bordered={false}>

            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>纠纷类型：</label>
                <select
                    style={{ width: '100%', padding: '8px', marginBottom: 16, borderRadius: '4px', border: '1px solid #d9d9d9' }}
                    value={disputeType}
                    onChange={(e) => setDisputeType(e.target.value)}
                >
                    <option value="deposit_refund">退还押金（租房）</option>
                    <option value="salary_arrears">拖欠工资（自由职业）</option>
                    <option value="consumer_rights">消费维权</option>
                </select>

                <label style={{ display: 'block', marginBottom: 8 }}>简要背景：</label>
                <TextArea
                    rows={3}
                    placeholder="例如：房东因墙面划痕拒绝退还5000元押金。"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    style={{ marginBottom: 16 }}
                />

                <Button type="primary" onClick={generateLetter} loading={loading} block>
                    {loading ? '正在生成专业维权函...' : '生成维权函'}
                </Button>
            </div>

            {generatedLetter && (
                <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '8px' }}>
                    <Title level={5}>生成草稿：</Title>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{generatedLetter}</pre>
                    <div style={{ marginTop: 16, display: 'flex', gap: '8px' }}>
                        <Button icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
                        <Button icon={<DownloadOutlined />} onClick={handleDownload}>下载</Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default LetterGenerator;
