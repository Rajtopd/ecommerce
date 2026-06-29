'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // On mount, check if admin_token exists by checking if we can access the API
  // or simply rely on the middleware redirecting if we are already logged in.
  // Actually, we can check document.cookie on client but HttpOnly cookies can't be read.
  // Let's just trust middleware to bounce us out if we aren't logged in, 
  // but if we *are* logged in, middleware doesn't bounce us FROM login to /admin automatically unless we tell it to.
  // Let's add a quick check or just leave it. If they load /admin/login while logged in, it's fine.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const data = await res.json();
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1C1410',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#FAFAF8',
        borderRadius: '4px',
        padding: '40px 36px',
        width: '380px',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '22px',
          color: '#1C1410',
          textAlign: 'center',
          letterSpacing: '0.08em',
          margin: '0 0 4px 0',
          fontWeight: 'normal'
        }}>
          Soul Sisters
        </h1>
        <p style={{
          fontFamily: '"Josefin Sans", sans-serif',
          fontWeight: 400,
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: '#6B5E54',
          textAlign: 'center',
          margin: '0 0 32px 0'
        }}>
          Admin Panel
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '46px',
              border: '0.5px solid #E8E4DF',
              borderRadius: '2px',
              fontFamily: '"Josefin Sans", sans-serif',
              fontWeight: 300,
              fontSize: '13px',
              color: '#1C1410',
              padding: '0 16px',
              boxSizing: 'border-box',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#1C1410'}
            onBlur={(e) => e.target.style.borderColor = '#E8E4DF'}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '46px',
              marginTop: '12px',
              backgroundColor: '#1C1410',
              color: '#fff',
              border: 'none',
              borderRadius: '2px',
              fontFamily: '"Josefin Sans", sans-serif',
              fontWeight: 400,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {isLoading ? 'Verifying...' : 'Enter'}
          </button>

          {error && (
            <p style={{
              fontFamily: '"Josefin Sans", sans-serif',
              fontWeight: 300,
              fontSize: '11px',
              color: '#C8726A',
              textAlign: 'center',
              marginTop: '10px',
              marginBottom: 0
            }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
