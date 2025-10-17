import { Link } from "react-router";

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  link,
  type = 'button',
  disabled = false,
  className = '',
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white focus:ring-black',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <Link to={link}>
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
    >
      {children}
    </button>
    </Link>
  );
}
