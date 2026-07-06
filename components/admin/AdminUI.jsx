'use client';

// Shared styled primitives for admin screens, following the existing
// admin conventions (inline styles, #C49B38 accent, #E0D0B8 borders).

export const FONT_HEAD = '"Cormorant Garamond", serif';

export function PageTitle({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: '28px', color: '#1A0F0A', margin: 0, fontWeight: 600 }}>{children}</h1>
      {right}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E0D0B8', borderRadius: '6px', padding: '24px', marginBottom: '20px', ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <h2 style={{ fontFamily: FONT_HEAD, fontSize: '20px', color: '#1A0F0A', margin: '0 0 16px 0', fontWeight: 600 }}>{children}</h2>;
}

export function Label({ children }) {
  return <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9C7B5E', marginBottom: '6px', fontWeight: 600 }}>{children}</label>;
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #E0D0B8',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#1A0F0A',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  backgroundColor: '#fff',
};

export function Input(props) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(props) {
  return <textarea rows={3} {...props} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, ...props.style }} />;
}

export function Select(props) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Btn({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: { backgroundColor: '#C49B38', color: '#1A0F0A' },
    dark: { backgroundColor: '#1A0F0A', color: '#FAF7F0' },
    ghost: { backgroundColor: 'transparent', color: '#9C7B5E', border: '1px solid #E0D0B8' },
    danger: { backgroundColor: 'transparent', color: '#8B1A2C', border: '1px solid #E8C4C4' },
  };
  return (
    <button
      {...props}
      style={{
        padding: '9px 18px', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '13px',
        cursor: props.disabled ? 'not-allowed' : 'pointer', opacity: props.disabled ? 0.6 : 1,
        fontFamily: 'inherit', ...variants[variant], ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      style={{
        width: '38px', height: '22px', borderRadius: '11px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: checked ? '#2E7D5E' : '#D8CDBB', position: 'relative', transition: 'background-color 0.15s', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: checked ? '19px' : '3px', width: '16px', height: '16px',
        borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.15s',
      }} />
    </button>
  );
}

export const th = {
  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9C7B5E',
  padding: '10px 14px', textAlign: 'left', backgroundColor: '#FAF7F0', borderBottom: '1px solid #E0D0B8', fontWeight: 600,
};

export const td = {
  padding: '12px 14px', fontSize: '13px', color: '#1A0F0A', borderBottom: '1px solid #F0E9DC', verticalAlign: 'middle',
};

export function Notice({ kind = 'success', children }) {
  const colors = kind === 'success'
    ? { bg: '#EAF4EF', border: '#BFDCCB', text: '#2E7D5E' }
    : { bg: '#FBEAEA', border: '#E8C4C4', text: '#8B1A2C' };
  return (
    <div style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, borderRadius: '4px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
      {children}
    </div>
  );
}
