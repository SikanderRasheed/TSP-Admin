import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import FlatButton from "@/components/shared/button/flatbutton";

const { Dragger } = Upload;

const App = () => {
  const [fileList, setFileList] = useState([]);

  const props = {
    name: "file",
    multiple: true,
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    showUploadList: false, // disable default list inside dragger
    onChange(info) {
      // Reverse to show newest uploads on top
      setFileList(info.fileList.slice().reverse());

      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <>
      <Dragger {...props} style={{ height: 200 }}>
        <p className="ant-upload-drag-icon mt-4 ">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text mb-3">
          Drag your file(s) to start uploading
        </p>
        <p className="or-line">
         Or
        </p>
        <FlatButton title="Browse File" className="browse-file mt-3 mb-3" />
      </Dragger>

      {/* Custom file list rendered below dragger */}
      <div style={{ marginTop: 20 }}>
        {fileList.map((file) => (
          <div
            key={file.uid}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              border: "1px solid #ddd",
              padding: 10,
              borderRadius: 4,
            }}
          >
            {file.thumbUrl ? (
              <img
                src={file.thumbUrl}
                alt={file.name}
                style={{
                  width: 40,
                  height: 40,
                  marginRight: 10,
                  objectFit: "cover",
                }}
              />
            ) : (
              <>
                <InboxOutlined style={{ fontSize: 32, marginRight: 10 }} />
              
              </>
            )}
            <div>
              <div>{file.name}</div>
              <div style={{ fontSize: 12, color: "#999" }}>
                {file.status === "uploading" &&
                  `${file.percent || 0}% uploading`}
                {file.status === "done" && "Uploaded"}
                {file.status === "error" && "Error"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
