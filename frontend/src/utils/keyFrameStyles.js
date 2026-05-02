// Define the keyframes animation as a string variable
export const keyframes = `
  @keyframes rotate-both-sides {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    50% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
    100% { transform: rotate(0deg); }
  }
`;

// Define a keyframes animation for oscillating rotation
export const oscillateRotation = {
  '0%': { transform: 'rotate(0deg)' },
  '25%': { transform: 'rotate(10deg)' },
  '50%': { transform: 'rotate(-10deg)' },
  '75%': { transform: 'rotate(10deg)' },
  '100%': { transform: 'rotate(0deg)' },
};