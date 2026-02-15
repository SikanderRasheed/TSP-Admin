import React, { useEffect } from "react";
import { Form } from "antd";
import { combineRules, validations } from "@/config/rules";
import BaseInput from "@/components/shared/inputs";
import dayjs from "dayjs";

const CertificateForm = ({ initialValues, loading, onSubmit, form }) => {
  const [internalForm] = Form.useForm();
  const activeForm = form || internalForm;

  useEffect(() => {
    if (initialValues) {
      // Prepare values for form
      const formValues = { ...initialValues };
      
      // Convert date strings to dayjs objects for DatePicker
      const dateFields = [
        'date_of_initial_registration',
        'date_of_issue',
        'date_of_expiry',
        'recertification_due_date'
      ];
      
      dateFields.forEach(field => {
        if (formValues[field] && typeof formValues[field] === 'string') {
          formValues[field] = dayjs(formValues[field]);
        }
      });
      
      // Handle QR image for edit mode - check all possible backend field names
      const qrPath = initialValues.qrImage || initialValues.qrCode || initialValues.image;
      
      if (qrPath && typeof qrPath === 'string') {
        // Prepend base URL if the path is relative (doesn't start with http)
        const baseUrl = 'https://testing.trustedsystempartners.com/';
        const fullUrl = qrPath.startsWith('http') ? qrPath : `${baseUrl}${qrPath.replace(/^\//, '')}`;
        
        // Convert URL string to fileList format so the Upload component shows the "path"
        formValues.qrImage = [
          {
            uid: '-1',
            name: qrPath.split('/').pop() || 'Existing QR Code', // Show the filename from the path
            status: 'done',
            url: fullUrl,
            thumbUrl: fullUrl,
          },
        ];
      }
      
      activeForm.setFieldsValue(formValues);
    } else {
      activeForm.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  return (
    <Form
      form={activeForm}
      layout="vertical"
      onFinish={onSubmit}
      className=""
    >
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-6">
          <BaseInput
            name="certificate_number"
            label="Certificate Number"
            placeholder="Enter certificate number"
            rules={combineRules("certificate_number", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="standard"
            label="Standard"
            placeholder="ISO 9001:2015"
            rules={combineRules("standard", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="organization"
            label="Organization"
            placeholder="Organization name"
            rules={combineRules("organization", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="country"
            label="Country"
            placeholder="Pakistan"
            rules={combineRules("country", validations.required)}
          />
        </div>

        <div className="col-span-12">
          <BaseInput
            name="address"
            label="Address"
            placeholder="Full address"
            rules={combineRules("address", validations.required)}
          />
        </div>

        <div className="col-span-12">
          <BaseInput
            name="scope"
            label="Scope"
            placeholder="Description of scope"
            rules={combineRules("scope", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="date_of_initial_registration"
            label="Date of Initial Registration"
            type="date"
            rules={combineRules("date_of_initial_registration", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="date_of_issue"
            label="Date of Issue"
            type="date"
            rules={combineRules("date_of_issue", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="date_of_expiry"
            label="Date of Expiry"
            type="date"
            rules={combineRules("date_of_expiry", validations.required)}
          />
        </div>

        <div className="col-span-6">
          <BaseInput
            name="recertification_due_date"
            label="Recertification Due Date"
            type="date"
            rules={combineRules("recertification_due_date", validations.required)}
          />
        </div>

        <div className="col-span-12">
          <BaseInput
            name="qrImage"
            label="QR Code Image"
            type="upload"
            placeholder="Click to upload QR Code"
            accept="image/*"
            rules={combineRules("qrImage", validations.required)}
          />
        </div>

        {/* <div className="col-span-12">
          <BaseInput
            name="status"
            label="Status"
            placeholder="Valid / Expired"
            rules={combineRules("status", validations.required)}
          />
        </div> */}
      </div>
    </Form>
  );
};

export default CertificateForm;
