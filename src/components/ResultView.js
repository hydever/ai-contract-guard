import React from 'react';
import { Card, Alert, List, Typography, Badge } from 'antd';

const { Text, Paragraph } = Typography;

const ResultView = ({ analysis, reviewLoading }) => {
    if (reviewLoading) {
        return (
            <Card title="风险分析报告" bordered={false} loading={true}>
                正在全速分析合同条款中...
            </Card>
        )
    }

    if (!analysis) {
        return (
            <Card title="风险分析报告" bordered={false}>
                <Text type="secondary">请上传合同，分析结果将显示在这里。</Text>
            </Card>
        );
    }

    const { risk_clauses, action_advice } = analysis;

    const renderRiskTag = (level) => {
        switch (level) {
            case '高风险': return <Badge status="error" text="高风险" />;
            case '中风险': return <Badge status="warning" text="中风险" />;
            default: return <Badge status="success" text="低风险" />;
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title={`发现 ${risk_clauses.length} 个风险条款`} bordered={false}>
                {risk_clauses.length === 0 && <Alert message="未发现重大风险，合同看起来很安全。" type="success" showIcon />}
                <List
                    itemLayout="vertical"
                    dataSource={risk_clauses}
                    renderItem={(item) => (
                        <List.Item style={{ background: item.risk_level === '高风险' ? '#fff1f0' : '#fffbe6', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                            <List.Item.Meta
                                title={renderRiskTag(item.risk_level)}
                                description={<Text strong>{item.original_text}</Text>}
                            />
                            <Paragraph><strong>风险解读:</strong> {item.risk_reason}</Paragraph>
                            <Alert message="修改建议" description={item.suggestion} type="info" showIcon />
                        </List.Item>
                    )}
                />
            </Card>

            <Card title="行动建议" bordered={false} style={{ background: '#f6ffed' }}>
                <Text>{action_advice}</Text>
            </Card>
        </div>
    );
};

export default ResultView;
