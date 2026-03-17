export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#f7971e', dark: '#e8850a', light: '#fbb040' },
        accent: { DEFAULT: '#ff4500', dark: '#e03d00' },
        dark: { DEFAULT: '#080810', card: '#0f0f1a', border: '#1e1e2e', muted: '#1a1a2e' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #ffd200 0%, #f7971e 40%, #ff4500 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, #ffd200 0%, #f7971e 100%)',
        'card-gradient': 'linear-gradient(145deg, #0f0f1a 0%, #13131f 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(247, 151, 30, 0.4)',
        'glow-sm': '0 0 10px rgba(247, 151, 30, 0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      }
    }
  },
  plugins: []
};
