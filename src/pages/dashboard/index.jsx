import React, { useMemo, useState, useEffect } from "react";
import { Form, Switch, App } from "antd";
// import { EyeOutlined } from "ant-design/icons";

import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@/hooks/reactQuery";
import useSweetAlert from "@/hooks/useSweetAlert";
import Helper from "@/helpers";
import CustomModal from "../../components/shared/modal";
import CustomTable from "../../components/shared/table/customtable";
import CertificateForm from "@/components/certificates/CertificateForm";
import Header from "../../components/header/header";

// Row-level switch with optimistic update and rollback on error
const RowStatusSwitch = ({ id, initialStatus, mutateToggle, isGlobalUpdating, showAlert }) => {
  const [checked, setChecked] = useState((initialStatus ?? "valid") !== "invalid");
  const [loading, setLoading] = useState(false);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [optimisticTarget, setOptimisticTarget] = useState(undefined);

  // Sync with initialStatus when it changes (e.g., when data refreshes)
  useEffect(() => {
    setChecked((initialStatus ?? "valid") !== "invalid");
  }, [initialStatus]);

  const onChange = (nextChecked) => {
    // optimistic UI update
    setChecked(nextChecked);
    setOptimisticTarget(nextChecked);
    setLoading(true);
    setIsOptimistic(true);

    const newStatus = nextChecked ? "valid" : "invalid";

    mutateToggle(
      { slug: id, data: { status: newStatus } },
      {
        onSuccess: () => {
          setLoading(false);
          setIsOptimistic(false);
          setOptimisticTarget(undefined);
        },
        onError: (err) => {
          setChecked(true);
          setLoading(false);
          setIsOptimistic(false);
          setOptimisticTarget(undefined);
          const message = err?.message || "Failed to update status. Please try again.";
          showAlert({
            title: "Update failed",
            text: message,
            icon: "error",
          });
        },
      }
    );
  };

  return (
    <Switch
      checked={checked}
      checkedChildren="Valid"
      unCheckedChildren="Invalid"
      onChange={onChange}
      loading={loading || isGlobalUpdating}
      disabled={loading || isGlobalUpdating}
    />
  );
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const { showAlert } = useSweetAlert();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  // Fetch all certificates using existing query hook and new endpoint
  const { data: certResponse, isLoading, refetch } = useQuery("getAllCertificates", {
    enabled: true,
  });

  // Base columns
  const baseColumns = [
    { title: 'Certificate No', dataIndex: 'certificate_number', key: 'certificate_number' },
    { title: 'Standard', dataIndex: 'standard', key: 'standard' },
    { title: 'Organization', dataIndex: 'organization', key: 'organization' },
  ];

  // Delete Certificate
  const handleDeleteProperty = async (id) => {
    const result = await showAlert({
      title: "Are you sure?",
      text: `Do you want to delete this Certificate`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      deleteCertificate({ slug: id, data: "" });
    }
  };

  // Columns with actions
  const columns = [
    ...baseColumns,
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <RowStatusSwitch
          id={record.__raw.id || record.__raw._id}
          initialStatus={record.__raw.status}
          mutateToggle={updateStatus}
          isGlobalUpdating={isUpdatingStatus}
          showAlert={showAlert}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <div className="table_btn_wrapper">
          <button
            onClick={() =>
              navigate(`/certificates/${record.key}`, { state: { record: record.__raw } })
            }
            className="table_btn"
          >
            Detail
          </button>
          <button
            onClick={() => {
              setEditRecord(record.__raw);
              setIsModalOpen(true);
              // Form values will be set by CertificateForm's useEffect
            }}
            className="table_btn"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteProperty(record.__raw.id || record.__raw._id)}
            className="table_btn"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>

        </div>
      ),
    },
  ];

  // Map API data
  const items = useMemo(() => {
    const list = certResponse?.data?.data || certResponse?.data || [];
    return Array.isArray(list) ? list : [];
  }, [certResponse]);

  const dataSource = useMemo(() => {
    return items.map((item, idx) => ({
      key: item.id ?? item._id ?? String(idx + 1),
      certificate_number: item.certificate_number || item.number || "-",
      standard: item.standard || "-",
      organization: item.organization || item.company_name || "-",
      __raw: item,
    }));
  }, [items]);

  const showModal = () => {
    setEditRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const { mutate: createCertificate, isPending: isCreating } = useMutation("createCertificate", {
    useFormData: true,
    invalidateQueries: [{ queryKey: ["getAllCertificates"] }],
    onSuccess: async () => {
      notification.success({
        message: "Success",
        description: "Certificate created successfully!",
        duration: 4,
      });
      handleOk();
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to create certificate. Please try again.";
      notification.error({
        message: "Error",
        description: errorMessage,
        duration: 4,
      });
    },
  });

  const { mutate: updateCertificate, isPending: isUpdating } = useMutation("updateCertificate", {
    useFormData: true,
    invalidateQueries: [{ queryKey: ["getAllCertificates"] }],
    onSuccess: async () => {
      notification.success({
        message: "Success",
        description: "Certificate updated successfully!",
        duration: 4,
      });
      handleOk();
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to update certificate. Please try again.";
      notification.error({
        message: "Error",
        description: errorMessage,
        duration: 4,
      });
    },
  });

  // Delete Certificate Mutation
  const { mutate: deleteCertificate, isPending: isDeleting } = useMutation(
    "deleteCertificate",
    {
      invalidateQueries: [{ queryKey: ["deleteCertificate"] }],
      onSuccess: async () => {
        notification.success({
          message: "Success",
          description: "Certificate deleted successfully!",
          duration: 4,
        });
        refetch();
      },
      onError: (error) => {
        const errorMessage = error?.data?.message || error?.message || "Failed to delete certificate. Please try again.";
        notification.error({
          message: "Error",
          description: errorMessage,
          duration: 4,
        });
      },
    }
  );

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation("toggleCertificate", {
    onSuccess: () => {
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(() => refetch());
      } else {
        Promise.resolve().then(() => refetch());
      }
      notification.success({
        message: "Success",
        description: "Certificate status updated successfully!",
        duration: 4,
      });
    },
    onError: (error) => {
      const errorMessage = error?.data?.message || error?.message || "Failed to update status. Please try again.";
      notification.error({
        message: "Error",
        description: errorMessage,
        duration: 4,
      });
    },
  });

  const onFinish = (values) => {
    const payload = { ...values };
    
    // Convert dayjs objects to string format for API
    const dateFields = [
      'date_of_initial_registration',
      'date_of_issue',
      'date_of_expiry',
      'recertification_due_date'
    ];
    
    dateFields.forEach(field => {
      if (payload[field] && typeof payload[field] === 'object' && payload[field].$d) {
        payload[field] = payload[field].format('YYYY-MM-DD');
      }
    });
    
    // Handle qrImage for upload
    if (values.qrImage && Array.isArray(values.qrImage) && values.qrImage.length > 0) {
      const file = values.qrImage[0];
      if (file.originFileObj) {
        payload.qrImage = file.originFileObj;
      } else {
        payload.qrImage = file.url || file.thumbUrl;
      }
    } else if (editRecord?.qrImage) {
      payload.qrImage = editRecord.qrImage;
    }

    if (editRecord?.id || editRecord?._id) {
      updateCertificate({ data: payload, slug: editRecord.id || editRecord._id });
    } else {
      createCertificate(payload);
    }
  };

  return (
    <>

      <Header />
      <section className="dashboard_sec">
        <div className="container">
          <div className="txt">
            <h1>Dashboard</h1>
          </div>
          <div className='txt_btn_wrapper'>
            <div className="txt">
              <h2>Certificate Details</h2>
            </div>
            <div className="btn">
              <button onClick={showModal} className="certificate-btn">
                Create New Certificate
              </button>
            </div>
          </div>
          <CustomTable data={dataSource} columns={columns} loading={isLoading || isUpdatingStatus} />
          <CustomModal
            title={editRecord ? "Edit Certificate" : "Create Certificate"}
            open={isModalOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            confirmLoading={isCreating || isUpdating}
            width={800}
          >
            <CertificateForm
              form={form}
              initialValues={editRecord || undefined}
              loading={isCreating || isUpdating}
              onSubmit={onFinish}
            />
          </CustomModal>
        </div>
      </section></>
  )
}

export default Dashboard
