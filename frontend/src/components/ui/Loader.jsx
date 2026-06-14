function Loader({ fullPage = false, text = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  )

  if (fullPage) {
    return <div className="min-h-[40vh] flex items-center justify-center">{content}</div>
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>
}

export default Loader
