const theme = {
  colors: {
    primary: '#71B340',      // Main green
    primaryDark: '#2F4A22',  // Dark green for hero background
    primaryLight: '#e9f5e1', // Light green for feature backgrounds
    secondary: '#F9A826',    // Accent color (orange/gold) for call-to-action elements
    text: '#383838',         // Dark gray for text
    textLight: '#666666',    // Medium gray for secondary text
    white: '#FFFFFF',        // White for text on dark backgrounds
    background: '#F7F9F4',   // Very light green tint for sections
    backgroundAlt: '#EDF3E8', // Slightly darker alt background
    border: '#DEEBD1',       // Light green for borders
    error: '#D32F2F'         // Error color
  },
  borderRadius: {
    small: '4px',
    default: '8px',
    pill: '50px'
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
    large: '0 8px 24px rgba(0, 0, 0, 0.16)'
  },
  transitions: {
    default: '0.3s ease'
  }
};

export default theme;