import React from 'react'
import { Link, NavLink, useLocation, useNavigate } from "react-router";

import useSweetAlert from "@/hooks/useSweetAlert";

const Header = () => {
     const user = window?.user?.user;
  console.log(" window?.user?.user", user);

  const { showAlert } = useSweetAlert();

  const handleSignout = async () => {
    const result = await showAlert({
      title: "Sign Out",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Clear storage and navigate to login
      window.helper.removeStorageData();
      window.user = null;
      // Use window.location.replace to prevent back navigation
      window.location.replace("/");
    }
  };
    return (
        <div className='header'>
            <div className="container d-flex">
                <div className='logo'>
                    <img src="/public/img/web_logo.png" alt="" />
                </div>
                <div className='d-flex'>
                    <div>
                        <button className='log-btn'  onClick={handleSignout}>Logout</button>
                    </div>
                    <div className='user_info'>
                        <div className='user-img'>
                            <img src={user?.profile_img  || "/public/img/profile.webp"}alt="" />
                        </div>
                        <div>
                            <p>{user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
