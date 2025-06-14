<<<<<<< HEAD
const YourList = () => {
  // your component code
};
=======
import '../Navbar.css';
import { useEffect } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser } from "react-icons/ai";



function YourList() {
    const pages = [
        { title: "Home", path: "/" },
        { title: "Recommendations", path: '/Recommendation' },
        { title: "Your List", path: '/YourList' },
    ];
    
    const navigate = useNavigate();
    
    const renderLinks = () =>
        pages.map((page) => (
            <li key={page.title}>
                <a
                    href={page.path}
                    className={
                        window.location.pathname.toLowerCase() === page.path.toLowerCase()
                            ? "active"
                            : ""
                    }
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(page.path);
                    }}
                >
                    {page.title}
                </a>
            </li>
        ));
    

    


    return (
        <div>
            <header className="navbar">
                <img
                    src="logo-placeholder.png"
                    alt="Logo"
                    className="navbar-logo"
                />
                <ul className="navbar-links">{renderLinks()}</ul>
                <div className="navbar-profile">
                    <a
                        href="/Profile"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/Profile");
                        }}
                    >
                        <AiOutlineUser className="navbar-profile-icon" />
                    </a>
                </div>
            </header>
            <div className="main-content">
                
            </div>
        </div>
    );
}
>>>>>>> main

export default YourList;
