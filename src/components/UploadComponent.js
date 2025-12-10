import React, { useState } from 'react';
import { Upload, message, Card, Button, List, Typography, Space } from 'antd';
import { InboxOutlined, UploadOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { Dragger } = Upload;
const { Text } = Typography;

const UploadComponent = ({ onOcrSuccess }) => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial file selection (don't upload yet)
    const beforeUpload = (file) => {
        setFileList(prev => [...prev, file]);
        return false; // Prevent automatic upload
    };

    const moveFile = (index, direction) => {
        const newFileList = [...fileList];
        if (direction === 'up' && index > 0) {
            [newFileList[index], newFileList[index - 1]] = [newFileList[index - 1], newFileList[index]];
        } else if (direction === 'down' && index < newFileList.length - 1) {
            [newFileList[index], newFileList[index + 1]] = [newFileList[index + 1], newFileList[index]];
        }
        setFileList(newFileList);
    };

    const removeFile = (index) => {
        const newFileList = [...fileList];
        newFileList.splice(index, 1);
        setFileList(newFileList);
    };

    const handleBatchUpload = async () => {
        if (fileList.length === 0) {
            message.warning('请先选择至少一张图片');
            return;
        }

        setLoading(true);

        try {
            // 将文件转换为 base64
            const filesData = await Promise.all(
                fileList.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            // 移除 data:image/jpeg;base64, 前缀
                            const base64 = reader.result.split(',')[1];
                            resolve({
                                filename: file.name,
                                content: base64
                            });
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            );

            // 发送 JSON 格式的数据
            const response = await axios.post(`${API_BASE_URL}/api/ocr`, {
                files: filesData
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            onOcrSuccess(response.data.text);

            if (response.data.is_mock) {
                message.warning('服务器未配置 OCR，使用测试文本');
            } else {
                message.success('多图识别合并完成');
            }
        } catch (error) {
            console.error(error);
            message.error('识别失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const props = {
        name: 'files',
        multiple: true,
        showUploadList: false, // We render our own list
        beforeUpload: beforeUpload,
        fileList: [], // Managed manually
    };

    return (
        <Card title="1. 上传合同图片 (支持多图排序)" bordered={false} style={{ marginBottom: 24 }}>
            <Dragger {...props} accept=".jpg,.jpeg,.png,.pdf" disabled={loading} style={{ marginBottom: 20 }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽上传合同 (支持图片或 PDF)</p>
                <p className="ant-upload-hint">支持多页 PDF 或多张图片拼接</p>
            </Dragger>

            {fileList.length > 0 && (
                <List
                    bordered
                    dataSource={fileList}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    icon={<ArrowUpOutlined />}
                                    disabled={index === 0}
                                    onClick={() => moveFile(index, 'up')}
                                />,
                                <Button
                                    icon={<ArrowDownOutlined />}
                                    disabled={index === fileList.length - 1}
                                    onClick={() => moveFile(index, 'down')}
                                />,
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeFile(index)}
                                />
                            ]}
                        >
                            <Space>
                                <Text strong>{index + 1}.</Text>
                                <Text>{item.name}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>({(item.size / 1024).toFixed(1)} KB)</Text>
                            </Space>
                        </List.Item>
                    )}
                    style={{ marginBottom: 20 }}
                />
            )}

            <Button
                type="primary"
                onClick={handleBatchUpload}
                loading={loading}
                block
                size="large"
                disabled={fileList.length === 0}
                icon={<UploadOutlined />}
            >
                开始识别与分析 ({fileList.length} 张图片)
            </Button>
        </Card>
    );
};

export default UploadComponent;
