import React from 'react';
import './LandingPage.css'; // External CSS

const Project = () => {
  return (
    <div className="container">
      <h1 className="logo">Welcome to CinemaStack!</h1>
      <p className="description">
        Discover your next favorite movie with our intelligent recommendation system.
        Developed by University of Waterloo students, CinemaStack analyzes your preferences
        and suggests films that match your taste, helping you discover hidden gems. Note your
        movie data may be used by researchers at the University of Waterloo. Your private
        information like emails and passwords will remain confidential.
      </p>
      <div className="button-container">
        <a href="/signup" className="btn btn-primary">Sign Up</a>
        <a href="/login" className="btn btn-secondary">Log In</a>
      </div>
    </div>
  );
};

export default Project;








// import { React, useEffect }from 'react';
// import { useNavigate } from 'react-router-dom';

// const Project = () => {
//   const navigate = useNavigate();

//   const handleConsentClick = () => {
//     navigate('/consent');
//   };

//   const handleLoginClick = () => {
//     navigate('/login');
//   };

// //   useEffect(() => {
// //     const existingUserId = localStorage.getItem('userId');
// //     console.log(existingUserId)
// //     if (!existingUserId) {
// //       fetch('http://localhost:5500/api/createAnonUser', {
// //         method: 'POST',
// //       })
// //         .then(res => res.json())
// //         .then(data => {
// //           if (data.userId) {
// //             localStorage.setItem('userId', data.userId);
// //           }
// //         })
// //         .catch(err => console.error('Error creating anonymous user:', err));
// //     }
// //   }, []);

//   return (
//     <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#1c1b2d', minHeight: '100vh', color: 'white' }}>
//       <h1>Welcome to Photuris</h1>
//       <p>This project built by the university of waterloo ... </p>
      
//       {/* <button
//         onClick={handleConsentClick}
//         style={{
//           marginTop: '2rem',
//           padding: '0.75rem 1.5rem',
//           fontSize: '1rem',
//           backgroundColor: '#4CAF50',
//           color: 'white',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//         }}
//       >
//         Read Terms and Conditions
//       </button> */}

//       <p style ={{marginTop: '10rem'}}>Already have an account? </p>
//       <button
//         onClick={handleLoginClick}
//         style={{
//           marginTop: '2rem',
//           padding: '0.75rem 1.5rem',
//           fontSize: '1rem',
//           backgroundColor: '#31337d',
//           color: 'white',
//           border: 'none',
//           borderRadius: '5px',
//           cursor: 'pointer',
//         }}
//       >
//         Log In
//       </button>
//     </div>
//   );
// };

// export default Project;
