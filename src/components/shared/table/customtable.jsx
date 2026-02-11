import React, { useState } from "react";
import { Table, Pagination } from "antd";

const CustomTable = ({
  columns,
  data,
  loading,
  rowKey,
  showPagination,
  pagination,
  onChange,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState("checkbox");
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {},
    onSelect: (record, selected, selectedRows) => {},
    onSelectAll: (selected, selectedRows, changeRows) => {},
  };

  return (
    <>
      <Table
        // rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        pagination={false}
        loading={loading}
        rowKey={rowKey}
        scroll={{
          x: 1000,
        }}
      />
      {showPagination && (
        <div className="custom-pagination d-flex justify-content-end mt-4">
          <Pagination
            current={pagination?.currentPage}
            total={pagination?.pageCount}
            pageSize={pagination?.perPage}
            onChange={onChange}
          />
        </div>
      )}
    </>
  );
};

export default CustomTable;
