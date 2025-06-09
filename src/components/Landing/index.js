import './App.css';
import { useEffect } from 'react';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Typography from "@mui/material/Typography";
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';

const pages = [{
    title: 'Recommendation',
    path: './Search'
}, {
    title: 'Yourlist',
    path: './YourList'
}];

const linkStyle = {
    display: "flex",
    justifyContent: "flex-end",
    textDecoration: "none",
    marginRight: "1rem",
    cursor: "pointer",
};

const containerStyle = {
    display: "flex",
    justifyContent: "flex-end",
};

function Landing() {
    useEffect(() => {
        const testApiCall = async () => {
            try {
                const response = await fetch('/api/getMovies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('API Response:', data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        testApiCall();
    }, []);

    const navigate = useNavigate();

    return (
        <div className="App">
            <header className="App-header">
                <AppBar position='static'>
                    <Typography 
                            variant="h6"
                            noWrap
                            component="a"
                            href="/"
                            sx={{
                              mr: 2,
                              display: { xs: 'none', md: 'flex' },
                              letterSpacing: '.2rem',
                              color: 'inherit',
                              textDecoration: 'none',
                            }}
                          >
                            Home
                    </Typography>
                    <Container style={containerStyle}>
                        {pages.map((page) => (
                                <Link
                                    color="inherit"
                                    style={linkStyle}
                                    onClick={() => navigate(page.path)}
                                >
                                    <Typography variant="h6" color="inherit" noWrap sx={{
                                        mr: 2,
                                        display: { xs: 'none', md: 'flex' },
                                        letterSpacing: '.2rem',
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        marginLeft: 0
                                        }}>
                                            {page.title}
                                    </Typography>
                                </Link>
                            ))}
                    </Container>
                </AppBar>
                <p>
                    Welcome to our Capstone Project
                </p>
            </header>
        </div>
    );
}

export default Landing;
