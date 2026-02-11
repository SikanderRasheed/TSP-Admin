import React from "react";
import { Descriptions, Card, Spin } from "antd";
import { useLocation } from "react-router";
import { dateHelper } from "@/helpers/dateHelper";

const CertificateDetail = () => {
  const location = useLocation();
  const cert = location.state?.record || {}; // ✅ use record from table click

  console.log("Certificate Record:", cert);
  console.log("Raw date values:", {
    date_of_initial_registration: cert.date_of_initial_registration,
    date_of_issue: cert.date_of_issue,
    date_of_expiry: cert.date_of_expiry,
    recertification_due_date: cert.recertification_due_date
  });
  
  console.log("Formatted date values (date only):", {
    date_of_initial_registration: cert.date_of_initial_registration 
      ? dateHelper.formatForDisplay(cert.date_of_initial_registration, dateHelper.formats.DISPLAY_DATE) 
      : "-",
    date_of_issue: cert.date_of_issue 
      ? dateHelper.formatForDisplay(cert.date_of_issue, dateHelper.formats.DISPLAY_DATE) 
      : "-",
    date_of_expiry: cert.date_of_expiry 
      ? dateHelper.formatForDisplay(cert.date_of_expiry, dateHelper.formats.DISPLAY_DATE) 
      : "-",
    recertification_due_date: cert.recertification_due_date 
      ? dateHelper.formatForDisplay(cert.recertification_due_date, dateHelper.formats.DISPLAY_DATE) 
      : "-"
  });

  return (
    <Card title="Certificate Details" bordered={false}>
      <Spin spinning={false}> {/* tum chaaho to spinning=true jab loading ho */}
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="ID">{cert.id || cert._id || "-"}</Descriptions.Item>
          <Descriptions.Item label="Certificate Number">{cert.certificate_number || "-"}</Descriptions.Item>
          <Descriptions.Item label="Organization">{cert.organization || cert.name || "-"}</Descriptions.Item>
          <Descriptions.Item label="Standard">{cert.standard || "-"}</Descriptions.Item>
          <Descriptions.Item label="Country">{cert.country || "-"}</Descriptions.Item>
          <Descriptions.Item label="Address">{cert.address || "-"}</Descriptions.Item>
          <Descriptions.Item label="Scope">{cert.scope || "-"}</Descriptions.Item>
          <Descriptions.Item label="Date of Initial Registration">
            {cert.date_of_initial_registration 
              ? dateHelper.formatForDisplay(cert.date_of_initial_registration, dateHelper.formats.DISPLAY_DATE) 
              : "-"}</Descriptions.Item>
          <Descriptions.Item label="Date of Issue">
            {cert.date_of_issue 
              ? dateHelper.formatForDisplay(cert.date_of_issue, dateHelper.formats.DISPLAY_DATE) 
              : "-"}</Descriptions.Item>
          <Descriptions.Item label="Date of Expiry">
            {cert.date_of_expiry 
              ? dateHelper.formatForDisplay(cert.date_of_expiry, dateHelper.formats.DISPLAY_DATE) 
              : "-"}</Descriptions.Item>
          <Descriptions.Item label="Recertification Due Date">
            {cert.recertification_due_date 
              ? dateHelper.formatForDisplay(cert.recertification_due_date, dateHelper.formats.DISPLAY_DATE) 
              : "-"}</Descriptions.Item>
          <Descriptions.Item label="QR Code Image">
            {(() => {
              const qrPath = cert.qrImage || cert.qrCode || cert.image;
              if (!qrPath) return "-";
              
              // Prepend base URL if the path is relative
              const baseUrl = 'https://testing.trustedsystempartners.com/';
              const fullUrl = qrPath.startsWith('http') ? qrPath : `${baseUrl}${qrPath.replace(/^\//, '')}`;
              
              return (
                <img 
                  src={fullUrl} 
                  alt="QR Code" 
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                />
              );
            })()}</Descriptions.Item>
          <Descriptions.Item label="Status">{cert.status || "-"}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </Card>
  );
};

export default CertificateDetail;
