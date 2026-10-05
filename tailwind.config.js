export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#0F172A', navy: '#1E293B', bg: '#F3F4F6', line: '#CBD5E1', act: '#EA580C', ok: '#16A34A', warn: '#F59E0B', err: '#DC2626' },
    fontFamily: { sans: ['Roboto', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'] },
    borderRadius: { DEFAULT: '6px' }
  } },
  plugins: []
}
