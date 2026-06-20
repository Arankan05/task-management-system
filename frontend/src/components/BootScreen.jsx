import BrandLogo, { APP_NAME } from './BrandLogo'

function BootScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <BrandLogo size="lg" />
      <div
        style={{
          width: 40,
          height: 40,
          marginTop: 24,
          border: '3px solid #e2e8f0',
          borderTopColor: '#7C3AED',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>Loading {APP_NAME}...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default BootScreen
