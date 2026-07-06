'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../globals.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
      backgroundColor: '#F0EBE1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '6px',
        padding: '40px 36px',
        width: '380px',
        border: '1px solid #E0D0B8',
        boxSizing: 'border-box',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: '#6E1A2C', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', color: '#E0D0B8', fontSize: '32px', fontWeight: 600, fontStyle: 'italic', lineHeight: 1 }}>S</span>
          </div>
        </div>
        
        <h1 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '26px',
          color: '#1A0F0A',
          textAlign: 'center',
          fontWeight: 600,
          margin: '0 0 4px 0'
        }}>
          Admin Panel
        </h1>
        <p style={{
          fontSize: '13px',
          color: '#5C3D2E',
          textAlign: 'center',
          margin: '0 0 32px 0'
        }}>
          Sign in to manage Soul Sisters
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            disabled={isLoading}
            autoComplete="username"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #E0D0B8',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#1A0F0A',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#C49B38'}
            onBlur={(e) => e.target.style.borderColor = '#E0D0B8'}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLoading}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #E0D0B8',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#1A0F0A',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#C49B38'}
            onBlur={(e) => e.target.style.borderColor = '#E0D0B8'}
          />
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#C49B38',
              color: '#1A0F0A',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#E8C96A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#C49B38'}
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>

          {error && (
            <p style={{
              fontSize: '13px',
              color: '#8B1A2C',
              textAlign: 'center',
              margin: '0',
              fontWeight: 500
            }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
