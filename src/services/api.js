const api = {
  // Authentication endpoints
   login: { method: "POST", url: "auth/login" },
  signup: { method: "POST", url: "auth/register" },

  // Certificates
  createCertificate: { method: "POST", url: "certificate/create" },
  getAllCertificates: { method: "GET", url: "certificate/getAllCertificates" },
  getCertificateById: { method: "GET", url: "certificate/getCertificate" },
  updateCertificate: { method: "PUT", url: "certificate/updateCertificate" },
  deleteCertificate: { method: "DELETE", url: "certificate/deleteCertificate" },
  toggleCertificate: { method: "PUT", url: "certificate/toggleCertificate" },
};

export default api;
