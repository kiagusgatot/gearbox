export function Card({children,className='',hover=false,onClick}){
  return <div onClick={onClick} className={`card ${hover?'hover:border-primary-300 hover:shadow-md transition-all cursor-pointer':''} ${className}`}>{children}</div>;
}
