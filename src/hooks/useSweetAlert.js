import Swal from "sweetalert2";
import "./sweetalert.css";
const useSweetAlert = () => {
  const showAlert = async ({
    title,
    text,
    icon,
    background,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
  }) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "custom-swal-confirm-btn",
        cancelButton: "custom-swal-cancel-btn",
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        content: "custom-swal-content",
      },
    });

    const result = await swalWithBootstrapButtons.fire({
      title,
      text,
      icon,
      background,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
    });

    return result;
  };

  return { showAlert };
};

export default useSweetAlert;
