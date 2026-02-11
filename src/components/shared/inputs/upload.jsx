import React, { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload, Form } from 'antd';

const UploadInput = ({ name, label, rules, placeholder, accept = 'image/*', maxCount = 1, value, onChange }) => {
  const [fileList, setFileList] = useState([]);

  // Handle initial value (for edit mode)
  useEffect(() => {
    console.log("UploadInput - value changed:", value);
    if (value && typeof value === 'string') {
      // If value is a URL string (existing image)
      const initialFileList = [
        {
          uid: '-1',
          name: 'Existing Image',
          status: 'done',
          url: value,
        },
      ];
      setFileList(initialFileList);
      // Immediately notify parent of the initial file list
      if (onChange) {
        onChange(initialFileList);
      }
    } else if (Array.isArray(value) && value.length > 0) {
      setFileList(value);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleChange = ({ fileList: newFileList }) => {
    console.log("UploadInput - handleChange:", newFileList);
    setFileList(newFileList);
    if (onChange) {
      onChange(newFileList);
    }
  };

  const normFile = (e) => {
    console.log("UploadInput - normFile:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={rules}
      valuePropName="fileList"
      getValueFromEvent={normFile}
    >
      <Upload
        name={name}
        listType="picture"
        maxCount={maxCount}
        accept={accept}
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={() => false} // Prevent auto upload
      >
        <Button icon={<UploadOutlined />}>
          {placeholder || 'Click to Upload'}
        </Button>
      </Upload>
    </Form.Item>
  );
};

export default UploadInput;