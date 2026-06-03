export function Button({ children, variant = 'primary', size = '', fullWidth = false, loading = false, className = '', ...props }) {
  const v = { primary:'btn-primary', secondary:'btn-secondary', outline:'btn-outline', danger:'btn-danger', success:'btn-success' };
  return <button className={`${v[variant]||'btn-primary'} ${size==='sm'?'btn-sm':''} ${fullWidth?'w-full':''} ${className}`} disabled={loading||props.disabled} {...props}>
    {loading ? 'Memuat...' : children}
  </button>;
}
